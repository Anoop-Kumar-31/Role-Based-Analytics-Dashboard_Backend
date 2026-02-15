const { Restaurant, Company, User } = require('../models');

// Create restaurant
exports.createRestaurant = async (req, res) => {
    try {
        const { restaurant_name, restaurant_email, restaurant_phone, restaurant_location, company_id } = req.body;

        const restaurant = await Restaurant.create({
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
    console.log("Finding Restaurants")
    try {
        const { company_id } = req.params;

        const where = { is_active: true };

        if (company_id) {
            where.company_id = company_id;
        } else if (req.userRole !== 'Super_Admin') {
            where.company_id = req.companyId;
        }

        const restaurants = await Restaurant.findAll({
            where,
            include: [
                { model: Company, as: 'company', attributes: ['company_id', 'company_name'] }
            ],
            order: [['createdAt', 'DESC']],
        });

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
        const { Forecast, Target, SalesCategory } = require('../models');

        const restaurant = await Restaurant.findOne({
            where: { restaurant_id, is_active: true },
            include: [
                { model: Company, as: 'company' },
                {
                    model: Forecast,
                    as: 'forecasts',
                    where: { is_active: true },
                    required: false,
                },
                {
                    model: Target,
                    as: 'targets',
                    where: { is_active: true },
                    required: false,
                },
                {
                    model: SalesCategory,
                    as: 'salesCategories',
                    where: { is_active: true },
                    required: false
                }
            ],
        });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with this ID'
            });
        }

        // Format revenue_targets from forecasts
        const revenue_targets = {};
        const monthNames = ['january', 'february', 'march', 'april', 'may', 'june',
            'july', 'august', 'september', 'october', 'november', 'december'];

        if (restaurant.forecasts && restaurant.forecasts.length > 0) {
            restaurant.forecasts.forEach(forecast => {
                const monthName = monthNames[forecast.forecast_month - 1];
                revenue_targets[monthName] = forecast.forecast_amount.toString();
            });
        }

        // Format labor_target and cogs_target from targets (get current month or latest)
        let labor_target = {};
        let cogs_target = {};

        if (restaurant.targets && restaurant.targets.length > 0) {
            // Sort to get most recent target
            const sortedTargets = restaurant.targets.sort((a, b) => {
                if (b.year !== a.year) return b.year - a.year;
                return b.month - a.month;
            });
            const target = sortedTargets[0];

            labor_target = {
                has_labor_target: true,
                overall_labor_target: target.overall_labor_target?.toString() || "0",
                foh_target: target.foh_target?.toString() || "0",
                boh_target: target.boh_target?.toString() || "0",
                includes_salaries: target.includes_salaries || false,
                foh_combined_salaried: target.foh_combined_salaried?.toString() || "0",
                boh_combined_salaried: target.boh_combined_salaried?.toString() || "0"
            };

            cogs_target = {
                has_cogs_target: true,
                food: target.food?.toString() || "0",
                pastry: target.pastry?.toString() || "0",
                beer: target.beer?.toString() || "0",
                wine: target.wine?.toString() || "0",
                liquor: target.liquor?.toString() || "0",
                NA_Bev: target.NA_Bev?.toString() || "0",
                smallwares: target.smallwares?.toString() || "0",
                others: target.others?.toString() || "0"
            };
        }

        // Build response
        const restaurantData = restaurant.toJSON();
        restaurantData.revenue_targets = revenue_targets;
        restaurantData.labor_target = labor_target;
        restaurantData.cogs_target = cogs_target;

        res.json({ data: restaurantData });

    } catch (error) {
        console.error('Get restaurant error:', error);
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

        const restaurant = await Restaurant.findOne({ where: { restaurant_id, is_active: true } });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with this ID'
            });
        }

        await restaurant.update(updates);

        res.json({
            message: 'Restaurant updated successfully',
            restaurant
        });

    } catch (error) {
        console.error('Update restaurant error:', error);
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

        const restaurant = await Restaurant.findOne({ where: { restaurant_id } });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No restaurant found with this ID'
            });
        }

        await restaurant.update({ is_active: false });

        res.json({
            message: 'Restaurant deleted successfully'
        });

    } catch (error) {
        console.error('Delete restaurant error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting restaurant'
        });
    }
};
