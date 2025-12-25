const axios = require('axios');
const crypto = require('crypto');

class PaymentService {
    constructor() {
        this.serverKey = process.env.MIDTRANS_SERVER_KEY;
        this.clientKey = process.env.MIDTRANS_CLIENT_KEY;
        this.isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        this.baseURL = this.isProduction
            ? 'https://api.midtrans.com'
            : 'https://api.sandbox.midtrans.com';

        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            auth: {
                username: this.serverKey,
                password: '',
            },
        });
    }

    async createTransaction(invoiceData) {
        try {
            const { invoice_number, amount, customer_details, item_details } = invoiceData;

            const payload = {
                transaction_details: {
                    order_id: invoice_number,
                    gross_amount: amount,
                },
                customer_details,
                item_details,
                enabled_payments: ['credit_card', 'gopay', 'shopeepay', 'bank_transfer'],
            };

            const response = await this.client.post('/v2/charge', payload);
            return response.data;
        } catch (error) {
            console.error('Midtrans create transaction error:', error.response?.data || error.message);
            throw new Error('Failed to create payment transaction');
        }
    }

    async getTransactionStatus(orderId) {
        try {
            const response = await this.client.get(`/v2/${orderId}/status`);
            return response.data;
        } catch (error) {
            console.error('Midtrans get status error:', error.response?.data || error.message);
            throw new Error('Failed to get transaction status');
        }
    }

    verifySignature(orderId, statusCode, grossAmount, serverKey) {
        const signatureString = `${orderId}${statusCode}${grossAmount}${serverKey}`;
        return crypto.createHash('sha512').update(signatureString).digest('hex');
    }

    async simulatePayment(invoiceNumber) {
        console.log(`[SIMULATION] Payment for invoice ${invoiceNumber} marked as paid`);
        return {
            transaction_id: `SIM-${Date.now()}`,
            order_id: invoiceNumber,
            transaction_status: 'settlement',
            payment_type: 'simulation',
            gross_amount: 0,
            transaction_time: new Date().toISOString(),
        };
    }
}

module.exports = new PaymentService();
