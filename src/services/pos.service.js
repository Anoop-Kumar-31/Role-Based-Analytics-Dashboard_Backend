const { Pos } = require('../models');

// Create POS
exports.createPos = async (posData, options = {}) => {
    try {
        const pos = await Pos.create(posData, options);
        return pos;
    } catch (error) {
        console.error('Create POS error:', error);
        throw new Error('Failed to create POS: ' + error.message);
    }
};

// Get POS by restaurant
exports.getPosByRestaurant = async (restaurant_id) => {
    try {
        const pos = await Pos.findOne({
            where: { restaurant_id, is_active: true },
        });

        return pos;
    } catch (error) {
        console.error('Get POS error:', error);
        throw new Error('Failed to fetch POS: ' + error.message);
    }
};

// Update POS
exports.updatePos = async (pos_id, updates) => {
    try {
        const pos = await Pos.findOne({ where: { pos_id } });

        if (!pos) {
            throw new Error('POS not found');
        }

        await pos.update(updates);
        return pos;
    } catch (error) {
        console.error('Update POS error:', error);
        throw new Error('Failed to update POS: ' + error.message);
    }
};

// Delete POS (soft delete)
exports.deletePos = async (pos_id) => {
    try {
        const pos = await Pos.findOne({ where: { pos_id } });

        if (!pos) {
            throw new Error('POS not found');
        }

        await pos.update({ is_active: false });
        return pos;
    } catch (error) {
        console.error('Delete POS error:', error);
        throw new Error('Failed to delete POS: ' + error.message);
    }
};
