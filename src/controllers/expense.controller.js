const expenseService = require('../services/expense.service');

// Create expense
exports.createExpense = async (req, res) => {
    try {
        const {
            restaurant_id,
            expense_date,  // Frontend sends expense_date
            type,          // Frontend sends type (maps to category)
            vendor_name,
            invoice_number,
            description,
            amounts,       // Frontend may send amounts as JSON string
            salaryAmount,  // Or specific amount fields
            ...otherFields
        } = req.body;

        // Parse amounts if it's a string
        let parsedAmounts = {};
        if (amounts) {
            parsedAmounts = typeof amounts === 'string' ? JSON.parse(amounts) : amounts;
        }

        // Calculate total amount from amounts object or use specific field
        let totalAmount = 0;
        if (salaryAmount) {
            totalAmount = parseFloat(salaryAmount);
        } else if (Object.keys(parsedAmounts).length > 0) {
            totalAmount = Object.values(parsedAmounts).reduce((sum, val) => sum + parseFloat(val || 0), 0);
        }

        // Call service layer
        const expense = await expenseService.createExpense({
            restaurant_id,
            user_id: req.userId,
            category: type,            // Map type to category
            vendor_name,
            invoice_number,
            date: expense_date,       // Map expense_date to date
            amount: totalAmount,
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
            message: 'Error creating expense',
            details: error.message
        });
    }
};

// Get all expenses
exports.getAllExpenses = async (req, res) => {
    try {
        const { company_id } = req.params;  // From URL parameter /:company_id?
        const { restaurant_id, category, start_date, end_date, page = 1, pageSize = 10 } = req.query;

        // Prepare filters for service layer
        const filters = {
            category,
            start_date,
            end_date,
            page,
            pageSize
        };

        // Only add company_id filter if provided (optional for Super Admin)
        // if (company_id) {
        //     filters.company_id = company_id;
        // }

        // Add restaurant filter if provided
        if (restaurant_id) {
            filters.restaurant_id = restaurant_id;
        }

        console.log('Expense filters:', filters);

        // Call service layer
        const result = await expenseService.getAllExpenses(filters);

        res.json({
            data: result
        });

    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching expenses',
            details: error.message
        });
    }
};

// Update expense
exports.updateExpense = async (req, res) => {
    try {
        const { expense_id } = req.params;
        const updates = req.body;

        // Call service layer
        const expense = await expenseService.updateExpense(expense_id, updates);

        res.json({
            message: 'Expense updated successfully',
            expense
        });

    } catch (error) {
        console.error('Update expense error:', error);

        if (error.message === 'Expense not found') {
            return res.status(404).json({
                error: 'Expense not found',
                message: 'No active expense found with this ID'
            });
        }

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

        // Call service layer
        await expenseService.deleteExpense(expense_id);

        res.json({
            message: 'Expense deleted successfully'
        });

    } catch (error) {
        console.error('Delete expense error:', error);

        if (error.message === 'Expense not found') {
            return res.status(404).json({
                error: 'Expense not found',
                message: 'No expense found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting expense'
        });
    }
};
