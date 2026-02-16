const revenueService = require('../services/revenue.service');
const userService = require('../services/user.service');
const restaurantService = require('../services/restaurant.service');

// Create revenue entry
// Payload from frontend:
// {
//     "beginning_date": "2026-02-13",
//     "ending_date": "2026-02-14",
//     "total_amount": "826",
//     "foh_labour": "7826",
//     "boh_labour": "728",
//     "other_labour": "86",
//     "food_sale": "867",
//     "beer_sale": "866",
//     "liquor_sale": "786",
//     "wine_sale": "786",
//     "beverage_sale": "786",
//     "other_sale": "785",
//     "total_guest": "786786"
// }
exports.createRevenue = async (req, res) => {
    try {
        const { restaurant_id } = req.params;

        // Prepare payload for service layer
        const revenueData = {
            restaurant_id,
            user_id: req.userId,
            created_by: req.body.user_id,
            beginning_date: req.body.beginning_date,
            ending_date: req.body.ending_date,
            total_amount: req.body.total_amount,
            foh_labour: req.body.foh_labour,
            boh_labour: req.body.boh_labour,
            other_labour: req.body.other_labour,
            food_sale: req.body.food_sale,
            beer_sale: req.body.beer_sale,
            liquor_sale: req.body.liquor_sale,
            wine_sale: req.body.wine_sale,
            beverage_sale: req.body.beverage_sale,
            other_sale: req.body.other_sale,
            total_guest: req.body.total_guest,
            notes: req.body.notes,
        };

        // Call service layer
        const revenue = await revenueService.createRevenue(revenueData);

        res.status(201).json({
            message: 'Revenue recorded successfully',
            data: revenue
        });

    } catch (error) {
        console.error('Create revenue error:', error);

        if (error.message === 'Restaurant not found') {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error creating revenue',
            details: error.message
        });
    }
};

// Get all revenues
exports.getAllRevenues = async (req, res) => {
    try {
        const { restaurant_id, user_id, start_date, end_date } = req.query;

        // Prepare filters for service layer
        const filters = {
            start_date,
            end_date
        };

        // Only apply company filtering if user_id is provided
        if (user_id) {
            const company_id = await userService.getCompanyId(user_id);

            if (company_id) {
                // Get all restaurant_id array from company_id
                if (restaurant_id) {
                    filters.restaurant_id = restaurant_id;
                } else {
                    const restaurant_ids = await restaurantService.getRestaurantIdsByCompanyId(company_id);
                    filters.restaurant_id = restaurant_ids;
                }
            }
        } else if (restaurant_id) {
            // If no user_id but restaurant_id provided (e.g., Super Admin filtering by restaurant)
            filters.restaurant_id = restaurant_id;
        }
        // If neither user_id nor restaurant_id provided, Super Admin sees all revenues (no filters)

        console.log('Revenue filters:', filters);

        // Call service layer
        const revenues = await revenueService.getAllRevenues(filters);

        res.json({ data: revenues });

    } catch (error) {
        console.error('Get revenues error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching revenues',
            details: error.message
        });
    }
};

// Update revenue
// params from frontend: revenue_id
// Payload from frontend:
// {
//     "beginning_date": "2026-02-01",
//     "ending_date": "2026-02-01",
//     "total_amount": "2752.00",
//     "foh_labour": "27.00",
//     "boh_labour": "5275.00",
//     "other_labour": "27.00",
//     "food_sale": "752.00",
//     "beer_sale": "753752.00",
//     "liquor_sale": "3753.00",
//     "wine_sale": "375.00",
//     "beverage_sale": "7867.00",
//     "other_sale": "753.00",
//     "total_guest": "8498498498",
//     "notes": "Optional notes"
// }
exports.updateRevenue = async (req, res) => {
    try {
        const { revenue_id } = req.params;
        const updates = req.body;

        // Call service layer
        const revenue = await revenueService.updateRevenue(revenue_id, updates);

        res.json({
            message: 'Revenue updated successfully',
            data: revenue
        });

    } catch (error) {
        console.error('Update revenue error:', error);

        if (error.message === 'Revenue not found') {
            return res.status(404).json({
                error: 'Revenue not found',
                message: 'No active revenue entry found with this ID'
            });
        }

        if (error.message === 'No valid fields provided for update') {
            return res.status(400).json({
                error: 'Bad request',
                message: error.message
            });
        }

        if (error.message.includes('date') || error.message.includes('number') || error.message.includes('integer')) {
            return res.status(400).json({
                error: 'Validation error',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error updating revenue',
            details: error.message
        });
    }
};

// Delete revenue (soft delete)
exports.deleteRevenue = async (req, res) => {
    try {
        const { revenue_id } = req.params;

        // Call service layer
        await revenueService.deleteRevenue(revenue_id);

        res.json({
            message: 'Revenue deleted successfully'
        });

    } catch (error) {
        console.error('Delete revenue error:', error);

        if (error.message === 'Revenue not found') {
            return res.status(404).json({
                error: 'Revenue not found',
                message: 'No revenue entry found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting revenue'
        });
    }
};
