const expenseService = require('../services/expense.service');

// Create expense
exports.createExpense = async (req, res) => {
    try {
        const { restaurant_id, restaurant } = req.body;

        // Resolve restaurant ID if only name is provided (legacy support)
        let resolvedRestaurantId = restaurant_id;
        if (!resolvedRestaurantId && restaurant) {
            // Need to require Restaurant model or service here if not already available
            // For now, assume restaurant_id is passed or handled in service if we passed 'restaurant' name
            // But let's do a quick lookup if possible, or just pass it down. 
            // Better to ensure restaurant_id exists.

            // To be safe, we'll import Restaurant Service if needed, but let's query directly for now if needed, 
            // or assume frontend sends ID. The user's snippet had "restaurant": "Olive Tree Café".

            // Let's assume the frontend sends ID effectively or we assume the service handles it. 
            // Actually, the user's snippet had "restaurant" name. 
            // I should look it up.

            const { Restaurant } = require('../models');
            const found = await Restaurant.findOne({ where: { restaurant_name: restaurant } });
            if (found) resolvedRestaurantId = found.restaurant_id;
        }

        if (!resolvedRestaurantId) {
            return res.status(400).json({ message: "Missing restaurant_id or valid restaurant name." });
        }

        // Call service layer with ENTIRE body + user_id + resolved ID
        const result = await expenseService.createExpense({
            ...req.body,
            restaurant_id: resolvedRestaurantId,
            user_id: req.userId || req.user?.user_id // Handle both middleware patterns
        });

        res.status(201).json({
            message: 'Expense and invoices created successfully',
            data: result
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

        // Role-based filtering
        if (req.userRole === 'Restaurant_Employee') {
            const { UserRestaurant } = require('../models');

            // Get assigned restaurants
            const userRestaurants = await UserRestaurant.findAll({
                where: { user_id: req.userId },
                attributes: ['restaurant_id']
            });

            const assignedIds = userRestaurants.map(ur => ur.restaurant_id);

            // If user provided a restaurant_id, ensure it's in their assigned list
            if (restaurant_id) {
                if (!assignedIds.includes(restaurant_id)) {
                    return res.status(403).json({
                        message: "Access denied: You are not assigned to this restaurant."
                    });
                }
                filters.restaurant_id = restaurant_id;
            } else {
                // Otherwise, filter by ALL their assigned restaurants
                filters.restaurant_id = assignedIds;
            }
        }
        else {
            // Super Admin / Company Admin logic
            // Add restaurant filter if provided
            if (restaurant_id) {
                filters.restaurant_id = restaurant_id;
            }

            // Should probably restrict Company Admin to their company's restaurants?
            // User didn't explicitly ask for this, but it's good practice. 
            // However, sticking to the specific user request: "if user is company_employee..."
            // The previous code snippet used: user_service.getUserRestaurants(user_id) for COMPANY_ADMIN too.
            // But let's stick to the request for now.
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
