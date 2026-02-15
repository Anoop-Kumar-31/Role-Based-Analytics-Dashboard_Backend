const { Expense, Restaurant, User } = require('../models');
const { Op } = require('sequelize');

// Create expense
exports.createExpense = async (req, res) => {
    try {
        const { restaurant_id, category, vendor_name, invoice_number, date, amount, description } = req.body;

        const expense = await Expense.create({
            restaurant_id,
            user_id: req.userId,
            category,
            vendor_name,
            invoice_number,
            date,
            amount,
            description,
        });

        res.status(201).json({
            message: 'Expense recorded successfully',
            expense
        });

    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error creating expense'
        });
    }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const { restaurant_id, category, start_date, end_date, page = 1, pageSize = 10 } = req.query;

        const where = { is_active: true };

        if (restaurant_id) where.restaurant_id = restaurant_id;
        if (category) where.category = category;

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
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name'] }
            ],
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['date', 'DESC']],
        });

        res.json({
            data: {
                expenses: rows,
                totalCount: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(count / pageSize),
            }
        });

    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching expenses'
        });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { expense_id } = req.params;
        const updates = req.body;

        const expense = await Expense.findOne({ where: { expense_id, is_active: true } });

        if (!expense) {
            return res.status(404).json({
                error: 'Expense not found',
                message: 'No active expense found with this ID'
            });
        }

        await expense.update(updates);

        res.json({
            message: 'Expense updated successfully',
            expense
        });

    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error updating expense'
        });
    }
};

// Delete expense (soft delete)
exports.deleteExpense = async (req, res) => {
    try {
        const { expense_id } = req.params;

        const expense = await Expense.findOne({ where: { expense_id } });

        if (!expense) {
            return res.status(404).json({
                error: 'Expense not found',
                message: 'No expense found with this ID'
            });
        }

        await expense.update({ is_active: false });

        res.json({
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting expense'
        });
    }
};
