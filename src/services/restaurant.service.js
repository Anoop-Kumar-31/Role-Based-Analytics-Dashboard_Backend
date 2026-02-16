const { Restaurant, Company, Forecast, Target, SalesCategory } = require('../models');

/**
 * Create a new restaurant
 * @param {Object} restaurantData - Restaurant data
 * @returns {Promise<Object>} Created restaurant
 * @throws {Error} If creation fails
 */
exports.createRestaurant = async (restaurantData) => {
    try {
        const restaurant = await Restaurant.create({
            restaurant_name: restaurantData.restaurant_name,
            restaurant_email: restaurantData.restaurant_email,
            restaurant_phone: restaurantData.restaurant_phone,
            restaurant_location: restaurantData.restaurant_location,
            company_id: restaurantData.company_id,
        });

        return restaurant;
    } catch (error) {
        console.error('Create restaurant service error:', error);
        throw error;
    }
};

/**
 * Get restaurants by company with optional filtering
 * @param {string} company_id - Company ID (optional)
 * @param {string} userRole - User role for authorization
 * @param {string} userCompanyId - User's company ID for authorization
 * @returns {Promise<Array>} Array of restaurants
 * @throws {Error} If query fails
 */
exports.getRestaurantsByCompany = async (company_id, userRole, userCompanyId) => {
    try {
        const where = { is_active: true };

        if (company_id) {
            where.company_id = company_id;
        } else if (userRole !== 'Super_Admin') {
            where.company_id = userCompanyId;
        }

        const restaurants = await Restaurant.findAll({
            where,
            include: [
                { model: Company, as: 'company', attributes: ['company_id', 'company_name'] }
            ],
            order: [['createdAt', 'DESC']],
        });

        return restaurants;
    } catch (error) {
        console.error('Get restaurants by company service error:', error);
        throw error;
    }
};

/**
 * Get restaurant by ID with full details (forecasts, targets, sales categories)
 * @param {string} restaurant_id - Restaurant ID
 * @returns {Promise<Object>} Restaurant with formatted targets and forecasts
 * @throws {Error} If restaurant not found
 */
exports.getRestaurantById = async (restaurant_id) => {
    try {
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
            throw new Error('Restaurant not found');
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

        // Format labor_target and cogs_target from targets
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

        return restaurantData;
    } catch (error) {
        console.error('Get restaurant by ID service error:', error);
        throw error;
    }
};

/**
 * Update restaurant
 * @param {string} restaurant_id - Restaurant ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated restaurant
 * @throws {Error} If restaurant not found
 */
exports.updateRestaurant = async (restaurant_id, updates) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { restaurant_id, is_active: true } });

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        await restaurant.update(updates);

        return restaurant;
    } catch (error) {
        console.error('Update restaurant service error:', error);
        throw error;
    }
};

/**
 * Delete restaurant (soft delete)
 * @param {string} restaurant_id - Restaurant ID
 * @returns {Promise<void>}
 * @throws {Error} If restaurant not found
 */
exports.deleteRestaurant = async (restaurant_id) => {
    try {
        const restaurant = await Restaurant.findOne({ where: { restaurant_id } });

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        await restaurant.update({ is_active: false });
    } catch (error) {
        console.error('Delete restaurant service error:', error);
        throw error;
    }
};

exports.getRestaurantIdsByCompanyId = async (company_id) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: { company_id, is_active: true },
            attributes: ['restaurant_id']
        });

        return restaurants.map(restaurant => restaurant.restaurant_id);
    } catch (error) {
        console.error('Get restaurant IDs by company ID service error:', error);
        throw error;
    }
};