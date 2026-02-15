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

    return Restaurant;
};
