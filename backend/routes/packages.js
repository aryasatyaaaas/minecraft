const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const orderController = require('../controllers/orderController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Public routes
router.get('/packages', packageController.getAllPackages);
router.get('/packages/:id', packageController.getPackageById);

// Admin routes
router.post('/packages', authMiddleware, requireRole('admin'), packageController.createPackage);
router.put('/packages/:id', authMiddleware, requireRole('admin'), packageController.updatePackage);
router.delete('/packages/:id', authMiddleware, requireRole('admin'), packageController.deletePackage);

// User routes
router.post('/orders', authMiddleware, orderController.createOrder);
router.get('/orders', authMiddleware, orderController.getUserOrders);
router.get('/orders/:id', authMiddleware, orderController.getOrderById);

module.exports = router;
