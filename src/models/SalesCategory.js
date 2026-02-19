const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const SalesCategory = sequelize.define('SalesCategory', {
        sales_category_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sales_category_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Category name (e.g., Food, Beer, Wine, Pastry)',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'sales_categories',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['sales_category_name'] },
            { unique: true, fields: ['restaurant_id', 'sales_category_name'] },
        ],
    });

    SalesCategory.associate = (models) => {
        SalesCategory.hasMany(models.Invoice, { foreignKey: 'sales_category_id', as: 'invoices' });
    };

    return SalesCategory;
};
