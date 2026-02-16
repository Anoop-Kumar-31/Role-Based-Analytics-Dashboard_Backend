const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, isCompanyAdmin } = require('../middleware/auth');
const { validateUserSignup, validateUserSignin, validateUUID } = require('../middleware/validation');

// Auth route
router.post('/signin', validateUserSignin, userController.signin);

// User management routes
router.post('/', verifyToken, isCompanyAdmin, validateUserSignup, userController.addUser);
router.get('/', verifyToken, userController.getAllUsers);
router.get('/by-email', verifyToken, userController.getUserByEmail); // Must be before /:user_id
router.get('/:user_id', verifyToken, validateUUID('user_id'), userController.getUserById);
router.put('/:user_id', verifyToken, validateUUID('user_id'), userController.updateUser);
router.delete('/:user_id', verifyToken, isCompanyAdmin, validateUUID('user_id'), userController.deleteUser);
router.patch('/:user_id/block', verifyToken, isCompanyAdmin, validateUUID('user_id'), userController.toggleBlockUser);
router.get('/restaurants/:user_id', verifyToken, validateUUID('user_id'), userController.getUserRestaurants);

module.exports = router;
