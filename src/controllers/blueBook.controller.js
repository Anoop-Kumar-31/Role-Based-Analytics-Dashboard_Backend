const blueBookService = require('../services/blueBook.service');

const restaurantService = require('../services/restaurant.service');

// Create blue book entry
exports.createBlueBook = async (req, res) => {
    try {
        let { restaurant_id } = req.body;
        const {
            restaurant, date, weather,
            breakfastSales, breakfastGuests, lunchSales, lunchGuests,
            dinnerSales, dinnerGuests, totalSales, foodSales, lbwSales,
            hourlyLabor, hoursWorked, notesData,
            // legacy/snake_case support
            breakfast_sales, breakfast_guests, lunch_sales, lunch_guests,
            dinner_sales, dinner_guests, total_sales, food_sales, lbw_sales,
            hourly_labor, hours_worked, notes_data
        } = req.body;

        // Lookup restaurant by name if ID is missing
        if (!restaurant_id && restaurant) {
            const restaurantObj = await restaurantService.getRestaurantByName(restaurant);
            if (restaurantObj) {
                restaurant_id = restaurantObj.restaurant_id;
            } else {
                return res.status(404).json({
                    error: 'Restaurant not found',
                    message: `Could not find restaurant with name: ${restaurant}`
                });
            }
        }

        if (!restaurant_id) {
            return res.status(400).json({
                error: 'Missing restaurant identifier',
                message: 'Restaurant ID or name is required'
            });
        }

        // Call service layer
        const blueBook = await blueBookService.createBlueBook({
            restaurant_id,
            user_id: req.userId,
            date,
            weather,
            breakfast_sales: breakfastSales || breakfast_sales,
            breakfast_guests: breakfastGuests || breakfast_guests,
            lunch_sales: lunchSales || lunch_sales,
            lunch_guests: lunchGuests || lunch_guests,
            dinner_sales: dinnerSales || dinner_sales,
            dinner_guests: dinnerGuests || dinner_guests,
            total_sales: totalSales || total_sales,
            food_sales: foodSales || food_sales,
            lbw_sales: lbwSales || lbw_sales,
            hourly_labor: hourlyLabor || hourly_labor,
            hours_worked: hoursWorked || hours_worked,
            notes_data: notesData || notes_data,
            item86s: req.body.item86s,
            miscNotes: req.body.miscNotes,
            staffNotes: req.body.staffNotes,
            callOuts: req.body.callOuts,
            maintenanceIssues: req.body.maintenanceIssues,
            misses: req.body.misses,
            wins: req.body.wins
        });

        res.status(201).json({
            message: 'Blue Book entry created successfully',
            blueBook
        });

    } catch (error) {
        console.error('Create blue book error:', error);

        if (error.message === 'Entry already exists for this date') {
            return res.status(400).json({
                error: 'Entry exists',
                message: 'A Blue Book entry for this date already exists'
            });
        }

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

        // Call service layer
        const blueBook = await blueBookService.getBlueBookByDate(restaurant_id, date);

        res.json({ blueBook });

    } catch (error) {
        console.error('Get blue book error:', error);

        if (error.message === 'BlueBook entry not found') {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'No Blue Book entry found for this date'
            });
        }

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

        // Call service layer
        const blueBook = await blueBookService.updateBlueBook(blue_book_id, updates);

        res.json({
            message: 'Blue Book entry updated successfully',
            blueBook
        });

    } catch (error) {
        console.error('Update blue book error:', error);

        if (error.message === 'BlueBook entry not found') {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'No active Blue Book entry found'
            });
        }

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

        // Call service layer
        await blueBookService.deleteBlueBook(blue_book_id);

        res.json({
            message: 'Blue Book entry deleted successfully'
        });

    } catch (error) {
        console.error('Delete blue book error:', error);

        if (error.message === 'BlueBook entry not found') {
            return res.status(404).json({
                error: 'Entry not found',
                message: 'No Blue Book entry found'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting Blue Book entry'
        });
    }
};
