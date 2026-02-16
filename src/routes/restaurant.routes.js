const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const { verifyToken, isCompanyAdmin } = require('../middleware/auth');
const { validateRestaurant, validateUUID, validateOptionalUUID } = require('../middleware/validation');

// Restaurant routes
router.post('/', verifyToken, isCompanyAdmin, validateRestaurant, restaurantController.createRestaurant);
router.get('/by-company/:company_id?', verifyToken, validateOptionalUUID('company_id'), restaurantController.getRestaurantsByCompany);
router.get('/:restaurant_id', verifyToken, validateUUID('restaurant_id'), restaurantController.getRestaurantById);
router.put('/:restaurant_id', verifyToken, isCompanyAdmin, validateUUID('restaurant_id'), restaurantController.updateRestaurant);
router.delete('/:restaurant_id', verifyToken, isCompanyAdmin, validateUUID('restaurant_id'), restaurantController.deleteRestaurant);

module.exports = router;
