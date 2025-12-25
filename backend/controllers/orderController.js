const db = require('../config/database');
const Package = require('../models/Package');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const orderSchema = Joi.object({
    package_id: Joi.number().integer().required(),
    server_name: Joi.string().min(3).max(50).required(),
});

exports.createOrder = async (req, res) => {
    const client = await db.pool.connect();

    try {
        const { error, value } = orderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { package_id, server_name } = value;
        const userId = req.user.id;

        await client.query('BEGIN');

        const package = await Package.getById(package_id);

        if (!package || !package.is_active) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Package not found or inactive' });
        }

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, package_id, server_name, total_price, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
            [userId, package_id, server_name, package.price]
        );

        const order = orderResult.rows[0];

        const invoiceNumber = `INV-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 3);

        const invoiceResult = await client.query(
            `INSERT INTO invoices (order_id, user_id, invoice_number, amount, status, due_date)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
            [order.id, userId, invoiceNumber, package.price, dueDate]
        );

        const invoice = invoiceResult.rows[0];

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Order created successfully',
            order,
            invoice,
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    } finally {
        client.release();
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT o.*, p.name as package_name, p.ram_mb, p.cpu_limit, p.disk_mb
       FROM orders o
       JOIN packages p ON o.package_id = p.id
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
            [userId]
        );

        res.json({ orders: result.rows });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `SELECT o.*, p.name as package_name, p.ram_mb, p.cpu_limit, p.disk_mb
       FROM orders o
       JOIN packages p ON o.package_id = p.id
       WHERE o.id = $1 AND o.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order: result.rows[0] });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
