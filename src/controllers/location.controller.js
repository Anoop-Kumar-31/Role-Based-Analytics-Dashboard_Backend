const { Restaurant, Forecast, Target } = require('../models');
const db = require('../models');

// Helper: Convert month name to number
const convertMonthNameToNumber = (monthName) => {
  const months = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };
  return months[monthName.toLowerCase()] || null;
};

// Update location (restaurant) data including forecasts and targets
exports.updateLocationData = async (req, res) => {
  try {
    const {
      id,                  // restaurant_id
      restaurantsData,     // basic restaurant fields
      forecastsData,       // revenue targets by month
      targetsData,         // labor and COGS targets
      updated_by,
      updated_at
    } = req.body;

    if (!id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Restaurant ID is required'
      });
    }

    // Start transaction
    await db.sequelize.transaction(async (transaction) => {
      // 1) Update Restaurant basic fields
      if (restaurantsData && typeof restaurantsData === 'object') {
        const restaurant = await Restaurant.findOne({
          where: { restaurant_id: id, is_active: true },
          transaction
        });

        if (!restaurant) {
          throw new Error('Restaurant not found');
        }

        await restaurant.update({
          ...restaurantsData,
          updatedAt: updated_at || new Date()
        }, { transaction });
      }

      // 2) Upsert Forecasts (monthly revenue targets)
      if (forecastsData && typeof forecastsData === 'object') {
        const year = targetsData?.year || new Date().getFullYear();

        for (const [monthName, amount] of Object.entries(forecastsData)) {
          const monthNumber = convertMonthNameToNumber(monthName);

          if (monthNumber && !isNaN(Number(amount))) {
            // Check if forecast exists
            const existingForecast = await Forecast.findOne({
              where: {
                restaurant_id: id,
                forecast_year: year,
                forecast_month: monthNumber
              },
              transaction
            });

            if (existingForecast) {
              // Update existing forecast
              await existingForecast.update({
                forecast_amount: Number(amount),
                updatedAt: updated_at || new Date()
              }, { transaction });
            } else {
              // Create new forecast
              await Forecast.create({
                restaurant_id: id,
                forecast_year: year,
                forecast_month: monthNumber,
                forecast_amount: Number(amount),
                is_active: true,
                createdAt: updated_at || new Date(),
                updatedAt: updated_at || new Date()
              }, { transaction });
            }
          }
        }
      }

      // 3) Upsert Target (labor and COGS targets)
      if (targetsData && typeof targetsData === 'object') {
        const year = targetsData.year || new Date().getFullYear();
        const month = targetsData.month || new Date().getMonth() + 1;

        // Check if target exists for this year/month
        const existingTarget = await Target.findOne({
          where: {
            restaurant_id: id,
            year: year,
            month: month
          },
          transaction
        });

        const targetData = {
          // Labor fields
          overall_labor_target: Number(targetsData.overall_labor_target || 0),
          foh_target: Number(targetsData.foh_target || 0),
          boh_target: Number(targetsData.boh_target || 0),
          foh_combined_salaried: Number(targetsData.foh_combined_salaried || 0),
          boh_combined_salaried: Number(targetsData.boh_combined_salaried || 0),
          other_combined_salaried: Number(targetsData.other_combined_salaried || 0),
          includes_salaries: targetsData.includes_salaries || false,

          // COGS fields
          food: Number(targetsData.food || 0),
          pastry: Number(targetsData.pastry || 0),
          beer: Number(targetsData.beer || 0),
          wine: Number(targetsData.wine || 0),
          liquor: Number(targetsData.liquor || 0),
          NA_Bev: Number(targetsData.NA_Bev || 0),
          smallwares: Number(targetsData.smallwares || 0),
          others: Number(targetsData.others || 0),
          cogs_target: Number(targetsData.cogs_target || 0),

          prime_percentage: targetsData.prime_percentage || null,
          is_active: true,
          updatedAt: updated_at || new Date()
        };

        if (existingTarget) {
          // Update existing target
          await existingTarget.update(targetData, { transaction });
        } else {
          // Create new target
          await Target.create({
            restaurant_id: id,
            year: year,
            month: month,
            ...targetData,
            createdAt: updated_at || new Date()
          }, { transaction });
        }
      }
    });

    // Success response
    res.status(200).json({
      message: 'Location, forecast, and target data updated successfully'
    });

  } catch (error) {
    console.error('Update location data error:', error);

    if (error.message === 'Restaurant not found') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Restaurant not found with this ID'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update location data',
      details: error.message
    });
  }
};
