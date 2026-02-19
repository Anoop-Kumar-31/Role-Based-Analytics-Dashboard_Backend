const dashboardService = require('../services/dashboard.service');
const { UserRestaurant, Restaurant } = require('../models');

exports.getDashboardStats = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        let restaurantIds = null; // null means ALL (for super admin)

        // Determine scope based on role
        if (req.userRole === 'Restaurant_Employee') {
            // Get assigned restaurants
            const userRestaurants = await UserRestaurant.findAll({
                where: { user_id: req.userId },
                attributes: ['restaurant_id']
            });
            restaurantIds = userRestaurants.map(ur => ur.restaurant_id);

            if (restaurantIds.length === 0) {
                return res.json({
                    summary: { totalRevenue: 0, totalExpense: 0, netProfit: 0 },
                    breakdown: []
                });
            }
        }
        else if (req.userRole === 'Company_Admin') {
            // Get all restaurants for this company
            // Currently req.companyId is attached by middleware
            if (!req.companyId) {
                return res.status(400).json({ message: "Company ID not found in token." });
            }

            const restaurants = await Restaurant.findAll({
                where: { company_id: req.companyId, is_active: true },
                attributes: ['restaurant_id']
            });
            restaurantIds = restaurants.map(r => r.restaurant_id);
        }
        // Super_Admin leaves restaurantIds as null (fetch all)

        // Call service
        const stats = await dashboardService.getStats(restaurantIds, { start_date, end_date });

        res.json({
            role: req.userRole,
            period: { start: start_date, end: end_date },
            ...stats
        });

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching dashboard stats',
            details: error.message
        });
    }
};
