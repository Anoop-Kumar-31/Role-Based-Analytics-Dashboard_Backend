const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { verifyToken } = require('../middleware/auth');

// Location routes
router.put('/', verifyToken, locationController.updateLocationData);

module.exports = router;
