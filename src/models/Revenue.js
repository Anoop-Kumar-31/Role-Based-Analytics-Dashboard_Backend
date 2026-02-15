const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Revenue = sequelize.define('Revenue', {
        creation_time: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        revenue_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        // Date range
        beginning_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        ending_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        // Total amount
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Labour costs
        foh_labour: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'Front of House Labour Cost',
        },
        boh_labour: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'Back of House Labour Cost',
        },
        other_labour: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Individual sales categories
        food_sale: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        beer_sale: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        liquor_sale: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        wine_sale: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        beverage_sale: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        other_sale: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Guest information
        total_guest: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        notes: {
            type: DataTypes.TEXT,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'revenues',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['user_id'] },
            { fields: ['beginning_date'] },
            { fields: ['ending_date'] },
            { fields: ['restaurant_id', 'beginning_date', 'ending_date'] },
        ],
    });

    return Revenue;
};
