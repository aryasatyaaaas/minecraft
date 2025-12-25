const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authMiddleware } = require('../middleware/auth');

router.get('/invoices', authMiddleware, billingController.getUserInvoices);
router.get('/invoices/:id', authMiddleware, billingController.getInvoiceById);
router.post('/payment/create', authMiddleware, billingController.createPayment);
router.post('/payment/webhook', billingController.paymentWebhook);
router.post('/payment/simulate', authMiddleware, billingController.simulatePayment);

module.exports = router;
