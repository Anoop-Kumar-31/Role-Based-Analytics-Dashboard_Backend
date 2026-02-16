const { UserRestaurant, Restaurant } = require('../models');

/**
 * Update user-restaurant associations
 * Replaces existing restaurant associations with new ones
 * @param {string} user_id - User ID
 * @param {Object} updates - Update data containing restaurant_name array
 * @returns {Promise<Array>} Updated user-restaurant associations
 * @throws {Error} If restaurants not found or update fails
 */
exports.updateUserRestaurants = async (user_id, updates) => {
    try {
        const { restaurant_name } = updates;

        // If no restaurant_name provided, skip update
        if (!restaurant_name || !Array.isArray(restaurant_name) || restaurant_name.length === 0) {
            return [];
        }

        // Find all restaurants by name
        const restaurants = await Restaurant.findAll({
            where: {
                restaurant_name: restaurant_name,
                is_active: true
            },
            attributes: ['restaurant_id', 'restaurant_name']
        });

        if (restaurants.length === 0) {
            throw new Error('No active restaurants found with the provided names');
        }

        // Delete existing user-restaurant associations
        await UserRestaurant.destroy({
            where: { user_id }
        });

        // Create new user-restaurant associations
        const userRestaurants = await Promise.all(
            restaurants.map(restaurant =>
                UserRestaurant.create({
                    user_id,
                    restaurant_id: restaurant.restaurant_id
                })
            )
        );

        return userRestaurants;

    } catch (error) {
        console.error('Update user restaurants service error:', error);
        throw error;
    }
};

/**
 * Get user's restaurant associations
 * @param {string} user_id - User ID
 * @returns {Promise<Array>} User's restaurants
 * @throws {Error} If query fails
 */
exports.getUserRestaurantAssociations = async (user_id) => {
    try {
        const userRestaurants = await UserRestaurant.findAll({
            where: { user_id },
            include: [
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['restaurant_id', 'restaurant_name', 'restaurant_location']
                }
            ]
        });

        return userRestaurants;

    } catch (error) {
        console.error('Get user restaurant associations service error:', error);
        throw error;
    }
};

/**
 * Add restaurant to user
 * @param {string} user_id - User ID
 * @param {string} restaurant_id - Restaurant ID
 * @returns {Promise<Object>} Created association
 * @throws {Error} If creation fails
 */
exports.addRestaurantToUser = async (user_id, restaurant_id) => {
    try {
        // Check if association already exists
        const existing = await UserRestaurant.findOne({
            where: { user_id, restaurant_id }
        });

        if (existing) {
            throw new Error('User is already associated with this restaurant');
        }

        const userRestaurant = await UserRestaurant.create({
            user_id,
            restaurant_id
        });

        return userRestaurant;

    } catch (error) {
        console.error('Add restaurant to user service error:', error);
        throw error;
    }
};

/**
 * Remove restaurant from user
 * @param {string} user_id - User ID
 * @param {string} restaurant_id - Restaurant ID
 * @returns {Promise<void>}
 * @throws {Error} If deletion fails
 */
exports.removeRestaurantFromUser = async (user_id, restaurant_id) => {
    try {
        const deleted = await UserRestaurant.destroy({
            where: { user_id, restaurant_id }
        });

        if (deleted === 0) {
            throw new Error('Association not found');
        }

    } catch (error) {
        console.error('Remove restaurant from user service error:', error);
        throw error;
    }
};
