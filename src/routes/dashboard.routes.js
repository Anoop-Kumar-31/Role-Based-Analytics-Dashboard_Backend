const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middleware/auth');

// Get dashboard stats (role-based content)
router.get('/stats', verifyToken, dashboardController.getDashboardStats);

module.exports = router;
