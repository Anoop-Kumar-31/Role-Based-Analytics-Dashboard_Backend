const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Restaurant = sequelize.define('Restaurant', {
        restaurant_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurant_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        restaurant_email: {
            type: DataTypes.STRING(255),
            validate: {
                isEmail: true,
            },
        },
        restaurant_phone: {
            type: DataTypes.STRING(20),
        },
        restaurant_location: {
            type: DataTypes.STRING(255),
        },
        restaurant_state: {
            type: DataTypes.STRING(100),
        },
        restaurant_zipcode: {
            type: DataTypes.STRING(10),
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        revenue_targets: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        labor_target: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
        cogs_target: {
            type: DataTypes.JSONB,
            defaultValue: {},
        },
    }, {
        tableName: 'restaurants',
        timestamps: true,
        indexes: [
            { fields: ['company_id'] },
            { fields: ['is_active'] },
        ],
    });

    Restaurant.associate = (models) => {
        Restaurant.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
        Restaurant.belongsToMany(models.User, {
            through: models.UserRestaurant,
            foreignKey: 'restaurant_id',
            as: 'users'
        });
        Restaurant.hasMany(models.Revenue, { foreignKey: 'restaurant_id', as: 'revenues' });
        Restaurant.hasMany(models.Expense, { foreignKey: 'restaurant_id', as: 'expenses' });
        Restaurant.hasMany(models.BlueBook, { foreignKey: 'restaurant_id', as: 'blueBooks' });

        // Conditional associations for models that may not exist yet
        if (models.Pos) Restaurant.hasOne(models.Pos, { foreignKey: 'restaurant_id', as: 'pos' });
        if (models.Forecast) Restaurant.hasMany(models.Forecast, { foreignKey: 'restaurant_id', as: 'forecasts' });
        if (models.Target) Restaurant.hasMany(models.Target, { foreignKey: 'restaurant_id', as: 'targets' });
        if (models.SalesCategory) Restaurant.hasMany(models.SalesCategory, { foreignKey: 'restaurant_id', as: 'salesCategories' });
    };

    return Restaurant;
};
