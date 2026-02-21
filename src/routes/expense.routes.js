const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth');
const { validateExpense, validateUUID, validateOptionalUUID } = require('../middleware/validation');

// Expense routes
router.post('/', verifyToken, validateExpense, expenseController.createExpense);
router.get('/:company_id?', verifyToken, validateOptionalUUID('company_id'), expenseController.getAllExpenses);
router.put('/:expense_id', verifyToken, validateUUID('expense_id'), expenseController.updateExpense);
router.patch('/:expense_id', verifyToken, validateUUID('expense_id'), expenseController.updateExpense);
router.delete('/:expense_id', verifyToken, validateUUID('expense_id'), expenseController.deleteExpense);

module.exports = router;
