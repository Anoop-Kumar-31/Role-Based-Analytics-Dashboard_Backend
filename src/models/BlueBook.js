const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BlueBook = sequelize.define('BlueBook', {
        blue_book_id: {
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        weather: {
            type: DataTypes.STRING(100),
        },
        // Sales Data
        breakfast_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        breakfast_guests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lunch_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        lunch_guests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        dinner_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        dinner_guests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        total_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        total_sales_last_year: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Food & Beverage
        food_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        lbw_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Labor
        hourly_labor: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        hourly_labor_percent: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        hours_worked: {
            type: DataTypes.DECIMAL(8, 2),
            defaultValue: 0,
        },
        splh: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'blue_books',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['date'] },
            { unique: true, fields: ['restaurant_id', 'date'] },
        ],
    });

    return BlueBook;
};
