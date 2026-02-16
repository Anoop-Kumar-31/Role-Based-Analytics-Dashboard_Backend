const { Expense, Restaurant, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new expense
 * @param {Object} expenseData - Expense data
 * @returns {Promise<Object>} Created expense
 * @throws {Error} If creation fails
 */
exports.createExpense = async (expenseData) => {
    try {
        const expense = await Expense.create({
            restaurant_id: expenseData.restaurant_id,
            user_id: expenseData.user_id,
            category: expenseData.category,
            vendor_name: expenseData.vendor_name,
            invoice_number: expenseData.invoice_number,
            date: expenseData.date,
            amount: expenseData.amount,
            description: expenseData.description,
        });

        return expense;
    } catch (error) {
        console.error('Create expense service error:', error);
        throw error;
    }
};

/**
 * Get all expenses with optional filters and pagination
 * @param {Object} filters - Filter options (restaurant_id, category, start_date, end_date, pagination)
 * @returns {Promise<Object>} Expenses array and pagination info
 * @throws {Error} If query fails
 */
exports.getAllExpenses = async (filters = {}) => {
    try {
        const { restaurant_id, category, start_date, end_date, page = 1, pageSize = 10, company_id } = filters;

        const where = { is_active: true };

        if (restaurant_id) where.restaurant_id = restaurant_id;
        if (company_id) where.company_id = company_id;
        if (category) where.category = category;

        // Filter by date range
        if (start_date && end_date) {
            where.date = { [Op.between]: [start_date, end_date] };
        } else if (start_date) {
            where.date = { [Op.gte]: start_date };
        } else if (end_date) {
            where.date = { [Op.lte]: end_date };
        }

        const offset = (page - 1) * pageSize;

        const { count, rows } = await Expense.findAndCountAll({
            where,
            include: [
                { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'restaurant_name'] },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name', 'email'] }
            ],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['date', 'DESC']],
        });

        return {
            expenses: rows,
            totalCount: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(count / pageSize),
        };
    } catch (error) {
        console.error('Get all expenses service error:', error);
        throw error;
    }
};

/**
 * Update expense
 * @param {string} expense_id - Expense ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated expense
 * @throws {Error} If expense not found
 */
exports.updateExpense = async (expense_id, updates) => {
    try {
        const expense = await Expense.findOne({ where: { expense_id, is_active: true } });

        if (!expense) {
            throw new Error('Expense not found');
        }

        await expense.update(updates);

        return expense;
    } catch (error) {
        console.error('Update expense service error:', error);
        throw error;
    }
};

/**
 * Delete expense (soft delete)
 * @param {string} expense_id - Expense ID
 * @returns {Promise<void>}
 * @throws {Error} If expense not found
 */
exports.deleteExpense = async (expense_id) => {
    try {
        const expense = await Expense.findOne({ where: { expense_id } });

        if (!expense) {
            throw new Error('Expense not found');
        }

        await expense.update({ is_active: false });
    } catch (error) {
        console.error('Delete expense service error:', error);
        throw error;
    }
};
