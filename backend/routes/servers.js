const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, serverController.getUserServers);
router.get('/:id', authMiddleware, serverController.getServerById);
router.get('/:id/stats', authMiddleware, serverController.getServerStats);
router.get('/:id/sso', authMiddleware, serverController.generateSSOToken);

module.exports = router;
