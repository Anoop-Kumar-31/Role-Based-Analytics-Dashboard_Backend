const { Revenue, Restaurant, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new revenue entry
 * @param {Object} revenueData - Revenue data including restaurant_id, user_id, dates, amounts, etc.
 * @returns {Promise<Object>} Created revenue object
 * @throws {Error} If restaurant not found or creation fails
 */
exports.createRevenue = async (revenueData) => {
    try {
        // Verify restaurant exists and is active
        const restaurant = await Restaurant.findOne({
            where: { restaurant_id: revenueData.restaurant_id, is_active: true }
        });

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        // Create revenue with defaults
        const revenue = await Revenue.create({
            creation_time: new Date(),
            revenue_id: uuidv4(),
            restaurant_id: revenueData.restaurant_id,
            user_id: revenueData.user_id,
            created_by: revenueData.created_by,
            beginning_date: revenueData.beginning_date,
            ending_date: revenueData.ending_date,
            total_amount: revenueData.total_amount || 0,
            foh_labour: revenueData.foh_labour || 0,
            boh_labour: revenueData.boh_labour || 0,
            other_labour: revenueData.other_labour || 0,
            food_sale: revenueData.food_sale || 0,
            beer_sale: revenueData.beer_sale || 0,
            liquor_sale: revenueData.liquor_sale || 0,
            wine_sale: revenueData.wine_sale || 0,
            beverage_sale: revenueData.beverage_sale || 0,
            other_sale: revenueData.other_sale || 0,
            total_guest: revenueData.total_guest || 0,
            notes: revenueData.notes,
        });

        return revenue;
    } catch (error) {
        console.error('Create revenue service error:', error);
        throw error;
    }
};

/**
 * Get all revenues with optional filters
 * @param {Object} filters - Filter options (restaurant_id, user_id, start_date, end_date)
 * @returns {Promise<Array>} Array of revenue objects with flattened relationships
 * @throws {Error} If query fails
 */
exports.getAllRevenues = async (filters = {}) => {
    try {
        const where = { is_active: true };

        // Filter by restaurant ID(s)
        if (filters.restaurant_id) {
            const restaurantIds = Array.isArray(filters.restaurant_id)
                ? filters.restaurant_id
                : [filters.restaurant_id];
            where.restaurant_id = { [Op.in]: restaurantIds };
        }

        // Filter by date range
        if (filters.start_date && filters.end_date) {
            where.beginning_date = { [Op.gte]: filters.start_date };
            where.ending_date = { [Op.lte]: filters.end_date };
        } else if (filters.start_date) {
            where.beginning_date = { [Op.gte]: filters.start_date };
        } else if (filters.end_date) {
            where.ending_date = { [Op.lte]: filters.end_date };
        }

        const revenues = await Revenue.findAll({
            where,
            include: [
                { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'restaurant_name'] },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name', 'email'] }
            ],
            order: [['beginning_date', 'ASC']],
        });

        // Flatten the response
        const flatRevenues = revenues.map(revenue => ({
            ...revenue.dataValues,
            restaurant_name: revenue.restaurant.restaurant_name,
            user_name: `${revenue.user.first_name} ${revenue.user.last_name}`,
            user_email: revenue.user.email
        }));

        return flatRevenues;
    } catch (error) {
        console.error('Get revenues service error:', error);
        throw error;
    }
};

/**
 * Update a revenue entry
 * @param {string} revenue_id - Revenue ID to update
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated revenue object
 * @throws {Error} If revenue not found or validation fails
 */
exports.updateRevenue = async (revenue_id, updates) => {
    try {
        // Whitelist of allowed fields
        const allowedFields = [
            'beginning_date',
            'ending_date',
            'total_amount',
            'foh_labour',
            'boh_labour',
            'other_labour',
            'food_sale',
            'beer_sale',
            'liquor_sale',
            'wine_sale',
            'beverage_sale',
            'other_sale',
            'total_guest',
            'notes'
        ];

        // Filter only allowed fields
        const filteredUpdates = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        // Validate that we have at least one field to update
        if (Object.keys(filteredUpdates).length === 0) {
            throw new Error('No valid fields provided for update');
        }

        // Validate date range if both dates are provided
        if (filteredUpdates.beginning_date && filteredUpdates.ending_date) {
            const beginDate = new Date(filteredUpdates.beginning_date);
            const endDate = new Date(filteredUpdates.ending_date);

            if (isNaN(beginDate.getTime()) || isNaN(endDate.getTime())) {
                throw new Error('Invalid date format - dates must be in YYYY-MM-DD format');
            }

            if (beginDate > endDate) {
                throw new Error('beginning_date cannot be after ending_date');
            }
        }

        // Validate numeric fields
        const numericFields = [
            'total_amount', 'foh_labour', 'boh_labour', 'other_labour',
            'food_sale', 'beer_sale', 'liquor_sale', 'wine_sale',
            'beverage_sale', 'other_sale'
        ];

        for (const field of numericFields) {
            if (filteredUpdates[field] !== undefined) {
                const value = parseFloat(filteredUpdates[field]);
                if (isNaN(value) || value < 0) {
                    throw new Error(`${field} must be a non-negative number`);
                }
            }
        }

        // Validate total_guest
        if (filteredUpdates.total_guest !== undefined) {
            const guestCount = parseInt(filteredUpdates.total_guest);
            if (isNaN(guestCount) || guestCount < 0) {
                throw new Error('total_guest must be a non-negative integer');
            }
            filteredUpdates.total_guest = guestCount;
        }

        // Find the revenue entry
        const revenue = await Revenue.findOne({ where: { revenue_id, is_active: true } });

        if (!revenue) {
            throw new Error('Revenue not found');
        }

        // Update the revenue entry
        await revenue.update(filteredUpdates);

        return revenue;
    } catch (error) {
        console.error('Update revenue service error:', error);
        throw error;
    }
};

/**
 * Delete a revenue entry (soft delete)
 * @param {string} revenue_id - Revenue ID to delete
 * @returns {Promise<Object>} Deleted revenue object
 * @throws {Error} If revenue not found
 */
exports.deleteRevenue = async (revenue_id) => {
    try {
        const revenue = await Revenue.findOne({ where: { revenue_id } });

        if (!revenue) {
            throw new Error('Revenue not found');
        }

        await revenue.update({ is_active: false });

        return revenue;
    } catch (error) {
        console.error('Delete revenue service error:', error);
        throw error;
    }
};
