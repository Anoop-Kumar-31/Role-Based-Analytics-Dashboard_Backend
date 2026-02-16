const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { verifyToken } = require('../middleware/auth');

// Role routes
router.get('/', verifyToken, rolesController.getAllRoles);
router.get('/:role_name', verifyToken, rolesController.getRoleByName);

module.exports = router;
