const { BlueBook, Restaurant, User } = require('../models');

/**
 * Create a new BlueBook entry
 * @param {Object} blueBookData - BlueBook data
 * @returns {Promise<Object>} Created BlueBook entry
 * @throws {Error} If duplicate entry exists or creation fails
 */
exports.createBlueBook = async (blueBookData) => {
    try {
        // Check if entry already exists for this date
        const existingEntry = await BlueBook.findOne({
            where: {
                restaurant_id: blueBookData.restaurant_id,
                date: blueBookData.date
            }
        });

        if (existingEntry) {
            throw new Error('Entry already exists for this date');
        }

        const blueBook = await BlueBook.create({
            restaurant_id: blueBookData.restaurant_id,
            user_id: blueBookData.user_id,
            date: blueBookData.date,
            weather: blueBookData.weather,
            breakfast_sales: blueBookData.breakfast_sales || 0,
            breakfast_guests: blueBookData.breakfast_guests || 0,
            lunch_sales: blueBookData.lunch_sales || 0,
            lunch_guests: blueBookData.lunch_guests || 0,
            dinner_sales: blueBookData.dinner_sales || 0,
            dinner_guests: blueBookData.dinner_guests || 0,
            total_sales: blueBookData.total_sales || 0,
            food_sales: blueBookData.food_sales || 0,
            lbw_sales: blueBookData.lbw_sales || 0,
            hourly_labor: blueBookData.hourly_labor || 0,
            hours_worked: blueBookData.hours_worked || 0,
        });

        return blueBook;
    } catch (error) {
        console.error('Create BlueBook service error:', error);
        throw error;
    }
};

/**
 * Get BlueBook entry by restaurant and date
 * @param {string} restaurant_id - Restaurant ID
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {Promise<Object>} BlueBook entry with relationships
 * @throws {Error} If entry not found
 */
exports.getBlueBookByDate = async (restaurant_id, date) => {
    try {
        const blueBook = await BlueBook.findOne({
            where: { restaurant_id, date, is_active: true },
            include: [
                { model: Restaurant, as: 'restaurant' },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name'] }
            ],
        });

        if (!blueBook) {
            throw new Error('BlueBook entry not found');
        }

        return blueBook;
    } catch (error) {
        console.error('Get BlueBook by date service error:', error);
        throw error;
    }
};

/**
 * Update BlueBook entry
 * @param {string} blue_book_id - BlueBook ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated BlueBook entry
 * @throws {Error} If entry not found
 */
exports.updateBlueBook = async (blue_book_id, updates) => {
    try {
        const blueBook = await BlueBook.findOne({ where: { blue_book_id, is_active: true } });

        if (!blueBook) {
            throw new Error('BlueBook entry not found');
        }

        await blueBook.update(updates);

        return blueBook;
    } catch (error) {
        console.error('Update BlueBook service error:', error);
        throw error;
    }
};

/**
 * Delete BlueBook entry (soft delete)
 * @param {string} blue_book_id - BlueBook ID
 * @returns {Promise<void>}
 * @throws {Error} If entry not found
 */
exports.deleteBlueBook = async (blue_book_id) => {
    try {
        const blueBook = await BlueBook.findOne({ where: { blue_book_id } });

        if (!blueBook) {
            throw new Error('BlueBook entry not found');
        }

        await blueBook.update({ is_active: false });
    } catch (error) {
        console.error('Delete BlueBook service error:', error);
        throw error;
    }
};
