const { SalesCategory } = require('../models');

// Create sales category
exports.createSalesCategory = async (categoryData, options = {}) => {
    try {
        const category = await SalesCategory.create(categoryData, options);
        return category;
    } catch (error) {
        console.error('Create sales category error:', error);
        throw new Error('Failed to create sales category: ' + error.message);
    }
};

// Get sales categories by restaurant
exports.getSalesCategoriesByRestaurant = async (restaurant_id) => {
    try {
        const categories = await SalesCategory.findAll({
            where: { restaurant_id, is_active: true },
            order: [['sales_category_name', 'ASC']],
        });

        return categories;
    } catch (error) {
        console.error('Get sales categories error:', error);
        throw new Error('Failed to fetch sales categories: ' + error.message);
    }
};

// Create default categories for a restaurant
exports.createDefaultCategories = async (restaurant_id, options = {}) => {
    try {
        const defaultCategories = [
            'Beer',
            'Others',
            'Tax',
            'Liquor',
            'Wine',
            'NA Beverage',
            'Food',
            'Pastry',
            'Retail',
            'Smallware',
            'Linen'
        ];

        const categories = [];
        for (const categoryName of defaultCategories) {
            const category = await SalesCategory.create({
                sales_category_name: categoryName,
                restaurant_id,
                is_active: true,
            }, options);
            categories.push(category);
        }

        return categories;
    } catch (error) {
        console.error('Create default categories error:', error);
        throw new Error('Failed to create default categories: ' + error.message);
    }
};

// Update sales category
exports.updateSalesCategory = async (sales_category_id, updates) => {
    try {
        const category = await SalesCategory.findOne({ where: { sales_category_id } });

        if (!category) {
            throw new Error('Sales category not found');
        }

        await category.update(updates);
        return category;
    } catch (error) {
        console.error('Update sales category error:', error);
        throw new Error('Failed to update sales category: ' + error.message);
    }
};

// Delete sales category (soft delete)
exports.deleteSalesCategory = async (sales_category_id) => {
    try {
        const category = await SalesCategory.findOne({ where: { sales_category_id } });

        if (!category) {
            throw new Error('Sales category not found');
        }

        await category.update({ is_active: false });
        return category;
    } catch (error) {
        console.error('Delete sales category error:', error);
        throw new Error('Failed to delete sales category: ' + error.message);
    }
};
