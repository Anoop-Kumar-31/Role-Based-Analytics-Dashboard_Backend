const { Revenue, Restaurant, User } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

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
        const {
            beginning_date,
            ending_date,
            total_amount,
            foh_labour,
            boh_labour,
            other_labour,
            food_sale,
            beer_sale,
            liquor_sale,
            wine_sale,
            beverage_sale,
            other_sale,
            total_guest,
            notes,
            user_id
        } = req.body;

        // Verify restaurant exists and user has access
        const restaurant = await Restaurant.findOne({
            where: { restaurant_id, is_active: true }
        });

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with this ID'
            });
        }

        const revenue = await Revenue.create({
            creation_time: new Date(),
            created_by: user_id,
            revenue_id: uuidv4(),
            restaurant_id,
            user_id: req.userId,
            beginning_date,
            ending_date,
            total_amount: total_amount || 0,
            foh_labour: foh_labour || 0,
            boh_labour: boh_labour || 0,
            other_labour: other_labour || 0,
            food_sale: food_sale || 0,
            beer_sale: beer_sale || 0,
            liquor_sale: liquor_sale || 0,
            wine_sale: wine_sale || 0,
            beverage_sale: beverage_sale || 0,
            other_sale: other_sale || 0,
            total_guest: total_guest || 0,
            notes,
        });

        res.status(201).json({
            message: 'Revenue recorded successfully',
            data: revenue
        });

    } catch (error) {
        console.error('Create revenue error:', error);
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

        const where = { is_active: true };

        if (restaurant_id) {
            // Parse multiple restaurant IDs
            const restaurantIds = Array.isArray(restaurant_id) ? restaurant_id : [restaurant_id];
            where.restaurant_id = { [Op.in]: restaurantIds };
        }

        if (user_id) where.user_id = user_id;

        // Filter by date range using beginning_date and ending_date
        if (start_date && end_date) {
            where.beginning_date = { [Op.gte]: start_date };
            where.ending_date = { [Op.lte]: end_date };
        } else if (start_date) {
            where.beginning_date = { [Op.gte]: start_date };
        } else if (end_date) {
            where.ending_date = { [Op.lte]: end_date };
        }

        const revenues = await Revenue.findAll({
            where,
            include: [
                { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'restaurant_name'] },
                { model: User, as: 'user', attributes: ['user_id', 'first_name', 'last_name', 'email'] }
            ],
            order: [['beginning_date']],
        });

        // make it in oneD res
        const flatRevenues = revenues.map(revenue => ({
            ...revenue.dataValues,
            restaurant_name: revenue.restaurant.restaurant_name,
            user_name: `${revenue.user.first_name} ${revenue.user.last_name}`,
            user_email: revenue.user.email
        }));

        res.json({ data: flatRevenues });

    } catch (error) {
        console.error('Get revenues error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching revenues'
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

        // Whitelist of fields that can be updated
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

        // Filter only allowed fields from request body
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });

        // Validate that we have at least one field to update
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'No valid fields provided for update'
            });
        }

        // Validate date range if both dates are provided
        if (updates.beginning_date && updates.ending_date) {
            const beginDate = new Date(updates.beginning_date);
            const endDate = new Date(updates.ending_date);

            if (isNaN(beginDate.getTime()) || isNaN(endDate.getTime())) {
                return res.status(400).json({
                    error: 'Invalid date format',
                    message: 'beginning_date and ending_date must be valid dates in YYYY-MM-DD format'
                });
            }

            if (beginDate > endDate) {
                return res.status(400).json({
                    error: 'Invalid date range',
                    message: 'beginning_date cannot be after ending_date'
                });
            }
        }

        // Validate numeric fields (ensure they are non-negative)
        const numericFields = [
            'total_amount', 'foh_labour', 'boh_labour', 'other_labour',
            'food_sale', 'beer_sale', 'liquor_sale', 'wine_sale',
            'beverage_sale', 'other_sale'
        ];

        for (const field of numericFields) {
            if (updates[field] !== undefined) {
                const value = parseFloat(updates[field]);
                if (isNaN(value) || value < 0) {
                    return res.status(400).json({
                        error: 'Invalid value',
                        message: `${field} must be a non-negative number`
                    });
                }
            }
        }

        // Validate total_guest (must be a non-negative integer)
        if (updates.total_guest !== undefined) {
            const guestCount = parseInt(updates.total_guest);
            if (isNaN(guestCount) || guestCount < 0) {
                return res.status(400).json({
                    error: 'Invalid value',
                    message: 'total_guest must be a non-negative integer'
                });
            }
            updates.total_guest = guestCount;
        }

        // Find the revenue entry
        const revenue = await Revenue.findOne({ where: { revenue_id, is_active: true } });

        if (!revenue) {
            return res.status(404).json({
                error: 'Revenue not found',
                message: 'No active revenue entry found with this ID'
            });
        }

        // Update the revenue entry
        await revenue.update(updates);

        res.json({
            message: 'Revenue updated successfully',
            data: revenue
        });

    } catch (error) {
        console.error('Update revenue error:', error);
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

        const revenue = await Revenue.findOne({ where: { revenue_id } });

        if (!revenue) {
            return res.status(404).json({
                error: 'Revenue not found',
                message: 'No revenue entry found with this ID'
            });
        }

        await revenue.update({ is_active: false });

        res.json({
            message: 'Revenue deleted successfully'
        });

    } catch (error) {
        console.error('Delete revenue error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting revenue'
        });
    }
};
