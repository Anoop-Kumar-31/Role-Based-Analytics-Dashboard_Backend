const { BlueBook, Restaurant, User } = require('../models');

// Create blue book entry
exports.createBlueBook = async (req, res) => {
    try {
        const { restaurant_id, date, weather, breakfast_sales, breakfast_guests, lunch_sales, lunch_guests,
            dinner_sales, dinner_guests, total_sales, food_sales, lbw_sales, hourly_labor, hours_worked } = req.body;

        //Check if entry already exists for this date
        const existingEntry = await BlueBook.findOne({ where: { restaurant_id, date } });

        if (existingEntry) {
            return res.status(400).json({
                error: 'Entry exists',
                message: 'A Blue Book entry for this date already exists'
            });
        }

        const blueBook = await BlueBook.create({
            restaurant_id,
            user_id: req.userId,
            date,
            weather,
            breakfast_sales: breakfast_sales || 0,
            breakfast_guests: breakfast_guests || 0,
            lunch_sales: lunch_sales || 0,
            lunch_guests: lunch_guests || 0,
            dinner_sales: dinner_sales || 0,
            dinner_guests: dinner_guests || 0,
            total_sales: total_sales || 0,
            food_sales: food_sales || 0,
            lbw_sales: lbw_sales || 0,
            hourly_labor: hourly_labor || 0,
            hours_worked: hours_worked || 0,
        });

        res.status(201).json({
            message: 'Blue Book entry created successfully',
            blueBook
        });

    } catch (error) {
        console.error('Create blue book error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error creating Blue Book entry'
        });
    }
};

// Get blue book by restaurant and date
exports.getBlueBookByDate = async (req, res) => {
    try {
        const { restaurant_id, date } = req.params;

        const blueBook = await BlueBook.findOne({
            where: { restaurant_id, date, is_active: true },
            include: [
                { model: Restaurant, as: 'restaurant' },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name'] }
            ],
        });

        if (!blueBook) {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'No Blue Book entry found for this date'
            });
        }

        res.json({ blueBook });

    } catch (error) {
        console.error('Get blue book error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching Blue Book entry'
        });
    }
};

// Update blue book
exports.updateBlueBook = async (req, res) => {
    try {
        const { blue_book_id } = req.params;
        const updates = req.body;

        const blueBook = await BlueBook.findOne({ where: { blue_book_id, is_active: true } });

        if (!blueBook) {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'No active Blue Book entry found'
            });
        }

        await blueBook.update(updates);

        res.json({
            message: 'Blue Book entry updated successfully',
            blueBook
        });

    } catch (error) {
        console.error('Update blue book error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error updating Blue Book entry'
        });
    }
};

// Delete blue book (soft delete)
exports.deleteBlueBook = async (req, res) => {
    try {
        const { blue_book_id } = req.params;

        const blueBook = await BlueBook.findOne({ where: { blue_book_id } });

        if (!blueBook) {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'No Blue Book entry found'
            });
        }

        await blueBook.update({ is_active: false });

        res.json({
            message: 'Blue Book entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete blue book error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting Blue Book entry'
        });
    }
};
