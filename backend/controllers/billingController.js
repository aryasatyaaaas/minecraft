const db = require('../config/database');
const paymentService = require('../services/paymentService');
const { provisioningQueue } = require('../jobs/provisioningQueue');

exports.getUserInvoices = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT i.*, o.server_name, p.name as package_name
       FROM invoices i
       JOIN orders o ON i.order_id = o.id
       JOIN packages p ON o.package_id = p.id
       WHERE i.user_id = $1
       ORDER BY i.created_at DESC`,
            [userId]
        );

        res.json({ invoices: result.rows });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `SELECT i.*, o.server_name, o.package_id, p.name as package_name, p.ram_mb, p.cpu_limit, p.disk_mb
       FROM invoices i
       JOIN orders o ON i.order_id = o.id
       JOIN packages p ON o.package_id = p.id
       WHERE i.id = $1 AND i.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        res.json({ invoice: result.rows[0] });
    } catch (error) {
        console.error('Get invoice error:', error);
        res.status(500).json({ error: 'Failed to fetch invoice' });
    }
};

exports.createPayment = async (req, res) => {
    try {
        const { invoice_id } = req.body;
        const userId = req.user.id;

        const invoiceResult = await db.query(
            `SELECT i.*, o.server_name, u.email, u.full_name
       FROM invoices i
       JOIN orders o ON i.order_id = o.id
       JOIN users u ON i.user_id = u.id
       WHERE i.id = $1 AND i.user_id = $2`,
            [invoice_id, userId]
        );

        if (invoiceResult.rows.length === 0) {
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        if (invoice.status === 'paid') {
            return res.status(400).json({ error: 'Invoice already paid' });
        }

        const paymentData = {
            invoice_number: invoice.invoice_number,
            amount: parseFloat(invoice.amount),
            customer_details: {
                email: invoice.email,
                first_name: invoice.full_name,
            },
            item_details: [{
                id: invoice.invoice_number,
                name: `Minecraft Hosting - ${invoice.server_name}`,
                price: parseFloat(invoice.amount),
                quantity: 1,
            }],
        };

        const transaction = await paymentService.createTransaction(paymentData);

        await db.query(
            `INSERT INTO payment_transactions (invoice_id, transaction_id, payment_gateway, amount, status, payment_type, raw_response)
       VALUES ($1, $2, 'midtrans', $3, 'pending', $4, $5)`,
            [invoice_id, transaction.transaction_id, invoice.amount, transaction.payment_type, JSON.stringify(transaction)]
        );

        res.json({
            message: 'Payment initiated',
            transaction,
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};

exports.paymentWebhook = async (req, res) => {
    const client = await db.pool.connect();

    try {
        const notification = req.body;

        const { order_id, transaction_status, fraud_status, transaction_id } = notification;

        await client.query('BEGIN');

        const invoiceResult = await client.query(
            'SELECT * FROM invoices WHERE invoice_number = $1',
            [order_id]
        );

        if (invoiceResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        let paymentStatus = 'pending';
        let invoiceStatus = 'pending';

        if (transaction_status === 'capture' || transaction_status === 'settlement') {
            if (fraud_status === 'accept' || !fraud_status) {
                paymentStatus = 'success';
                invoiceStatus = 'paid';
            }
        } else if (transaction_status === 'pending') {
            paymentStatus = 'pending';
            invoiceStatus = 'pending';
        } else if (transaction_status === 'deny' || transaction_status === 'cancel' || transaction_status === 'expire') {
            paymentStatus = 'failed';
            invoiceStatus = 'cancelled';
        }

        await client.query(
            `UPDATE payment_transactions 
       SET status = $1, raw_response = $2, updated_at = CURRENT_TIMESTAMP
       WHERE transaction_id = $3`,
            [paymentStatus, JSON.stringify(notification), transaction_id]
        );

        if (invoiceStatus === 'paid' && invoice.status !== 'paid') {
            await client.query(
                `UPDATE invoices 
         SET status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = $1, payment_reference = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
                [notification.payment_type, transaction_id, invoice.id]
            );

            await client.query(
                `UPDATE orders SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
                [invoice.order_id]
            );

            await provisioningQueue.add({
                orderId: invoice.order_id,
                userId: invoice.user_id,
            });

            console.log(`✓ Payment confirmed for invoice ${order_id}, provisioning queued`);
        }

        await client.query('COMMIT');

        res.json({ message: 'Webhook processed' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Payment webhook error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    } finally {
        client.release();
    }
};

exports.simulatePayment = async (req, res) => {
    const client = await db.pool.connect();

    try {
        const { invoice_id } = req.body;
        const userId = req.user.id;

        await client.query('BEGIN');

        const invoiceResult = await client.query(
            'SELECT * FROM invoices WHERE id = $1 AND user_id = $2',
            [invoice_id, userId]
        );

        if (invoiceResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Invoice not found' });
        }

        const invoice = invoiceResult.rows[0];

        if (invoice.status === 'paid') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Invoice already paid' });
        }

        const simulatedPayment = await paymentService.simulatePayment(invoice.invoice_number);

        await client.query(
            `INSERT INTO payment_transactions (invoice_id, transaction_id, payment_gateway, amount, status, payment_type, raw_response)
       VALUES ($1, $2, 'simulation', $3, 'success', 'simulation', $4)`,
            [invoice_id, simulatedPayment.transaction_id, invoice.amount, JSON.stringify(simulatedPayment)]
        );

        await client.query(
            `UPDATE invoices 
       SET status = 'paid', paid_at = CURRENT_TIMESTAMP, payment_method = 'simulation', payment_reference = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
            [simulatedPayment.transaction_id, invoice_id]
        );

        await client.query(
            `UPDATE orders SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [invoice.order_id]
        );

        await provisioningQueue.add({
            orderId: invoice.order_id,
            userId: invoice.user_id,
        });

        await client.query('COMMIT');

        res.json({
            message: 'Payment simulated successfully, server provisioning started',
            transaction: simulatedPayment,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Simulate payment error:', error);
        res.status(500).json({ error: 'Payment simulation failed' });
    } finally {
        client.release();
    }
};
