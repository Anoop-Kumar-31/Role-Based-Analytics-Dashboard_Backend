const { Forecast } = require('../models');

// Create forecast
exports.createForecast = async (forecastData, options = {}) => {
    try {
        const forecast = await Forecast.create(forecastData, options);
        return forecast;
    } catch (error) {
        console.error('Create forecast error:', error);
        throw new Error('Failed to create forecast: ' + error.message);
    }
};

// Get forecasts by restaurant
exports.getForecastsByRestaurant = async (restaurant_id, year = null) => {
    try {
        const where = { restaurant_id, is_active: true };

        if (year) {
            where.forecast_year = year;
        }

        const forecasts = await Forecast.findAll({
            where,
            order: [['forecast_year', 'DESC'], ['forecast_month', 'ASC']],
        });

        return forecasts;
    } catch (error) {
        console.error('Get forecasts error:', error);
        throw new Error('Failed to fetch forecasts: ' + error.message);
    }
};

// Update forecast
exports.updateForecast = async (forecast_id, updates) => {
    try {
        const forecast = await Forecast.findOne({ where: { forecast_id } });

        if (!forecast) {
            throw new Error('Forecast not found');
        }

        await forecast.update(updates);
        return forecast;
    } catch (error) {
        console.error('Update forecast error:', error);
        throw new Error('Failed to update forecast: ' + error.message);
    }
};

// Delete forecast (soft delete)
exports.deleteForecast = async (forecast_id) => {
    try {
        const forecast = await Forecast.findOne({ where: { forecast_id } });

        if (!forecast) {
            throw new Error('Forecast not found');
        }

        await forecast.update({ is_active: false });
        return forecast;
    } catch (error) {
        console.error('Delete forecast error:', error);
        throw new Error('Failed to delete forecast: ' + error.message);
    }
};
