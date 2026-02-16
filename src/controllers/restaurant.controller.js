const restaurantService = require('../services/restaurant.service');

// Create restaurant
exports.createRestaurant = async (req, res) => {
    try {
        const { restaurant_name, restaurant_email, restaurant_phone, restaurant_location, company_id } = req.body;

        // Call service layer
        const restaurant = await restaurantService.createRestaurant({
            restaurant_name,
            restaurant_email,
            restaurant_phone,
            restaurant_location,
            company_id,
        });

        res.status(201).json({
            message: 'Restaurant created successfully',
            restaurant
        });

    } catch (error) {
        console.error('Create restaurant error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error creating restaurant'
        });
    }
};

// Get all restaurants by company
exports.getRestaurantsByCompany = async (req, res) => {
    console.log("Finding Restaurants");
    try {
        const { company_id } = req.params;

        // Call service layer
        const restaurants = await restaurantService.getRestaurantsByCompany(
            company_id,
            req.userRole,
            req.companyId
        );

        res.json({ data: restaurants });

    } catch (error) {
        console.error('Get restaurants error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching restaurants'
        });
    }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        // Call service layer
        const restaurantData = await restaurantService.getRestaurantById(restaurant_id);

        res.json({ data: restaurantData });

    } catch (error) {
        console.error('Get restaurant error:', error);

        if (error.message === 'Restaurant not found') {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch restaurant'
        });
    }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const updates = req.body;

        // Call service layer
        const restaurant = await restaurantService.updateRestaurant(restaurant_id, updates);

        res.json({
            message: 'Restaurant updated successfully',
            restaurant
        });

    } catch (error) {
        console.error('Update restaurant error:', error);

        if (error.message === 'Restaurant not found') {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error updating restaurant'
        });
    }
};

// Delete restaurant (soft delete)
exports.deleteRestaurant = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        // Call service layer
        await restaurantService.deleteRestaurant(restaurant_id);

        res.json({
            message: 'Restaurant deleted successfully'
        });

    } catch (error) {
        console.error('Delete restaurant error:', error);

        if (error.message === 'Restaurant not found') {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No restaurant found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting restaurant'
        });
    }
};
