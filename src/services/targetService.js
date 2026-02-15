const { Target } = require('../models');

// Create target
exports.createTarget = async (targetData, options = {}) => {
    try {
        const target = await Target.create(targetData, options);
        return target;
    } catch (error) {
        console.error('Create target error:', error);
        throw new Error('Failed to create target: ' + error.message);
    }
};

// Get targets by restaurant
exports.getTargetsByRestaurant = async (restaurant_id, year = null, month = null) => {
    try {
        const where = { restaurant_id, is_active: true };

        if (year) where.year = year;
        if (month) where.month = month;

        const targets = await Target.findAll({
            where,
            order: [['year', 'DESC'], ['month', 'DESC']],
        });

        return targets;
    } catch (error) {
        console.error('Get targets error:', error);
        throw new Error('Failed to fetch targets: ' + error.message);
    }
};

// Get current month target
exports.getCurrentTarget = async (restaurant_id) => {
    try {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;

        const target = await Target.findOne({
            where: {
                restaurant_id,
                year: currentYear,
                month: currentMonth,
                is_active: true,
            },
        });

        return target;
    } catch (error) {
        console.error('Get current target error:', error);
        throw new Error('Failed to fetch current target: ' + error.message);
    }
};

// Update target
exports.updateTarget = async (target_id, updates) => {
    try {
        const target = await Target.findOne({ where: { target_id } });

        if (!target) {
            throw new Error('Target not found');
        }

        await target.update(updates);
        return target;
    } catch (error) {
        console.error('Update target error:', error);
        throw new Error('Failed to update target: ' + error.message);
    }
};

// Delete target (soft delete)
exports.deleteTarget = async (target_id) => {
    try {
        const target = await Target.findOne({ where: { target_id } });

        if (!target) {
            throw new Error('Target not found');
        }

        await target.update({ is_active: false });
        return target;
    } catch (error) {
        console.error('Delete target error:', error);
        throw new Error('Failed to delete target: ' + error.message);
    }
};
