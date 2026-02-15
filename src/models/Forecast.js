const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Forecast = sequelize.define('Forecast', {
        forecast_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        forecast_year: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Year for the forecast (e.g., 2024)',
        },
        forecast_month: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 12,
            },
            comment: 'Month number (1-12)',
        },
        forecast_amount: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Revenue forecast/target for the month',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'forecasts',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['forecast_year', 'forecast_month'] },
            { unique: true, fields: ['restaurant_id', 'forecast_year', 'forecast_month'] },
        ],
    });

    return Forecast;
};
