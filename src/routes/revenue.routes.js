const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenue.controller');
const { verifyToken } = require('../middleware/auth');
const { validateRevenue, validateUUID } = require('../middleware/validation');

// Revenue routes
router.post('/:restaurant_id/revenue', verifyToken, validateUUID('restaurant_id'), validateRevenue, revenueController.createRevenue);
router.get('/revenue/all', verifyToken, revenueController.getAllRevenues);
router.put('/revenue/:revenue_id', verifyToken, validateUUID('revenue_id'), revenueController.updateRevenue);
router.delete('/revenue/:revenue_id', verifyToken, validateUUID('revenue_id'), revenueController.deleteRevenue);

module.exports = router;
