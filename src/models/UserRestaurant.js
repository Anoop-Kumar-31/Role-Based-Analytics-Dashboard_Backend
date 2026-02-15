const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const UserRestaurant = sequelize.define('UserRestaurant', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        restaurant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        tableName: 'user_restaurants',
        timestamps: true,
        indexes: [
            { fields: ['user_id'] },
            { fields: ['restaurant_id'] },
            { unique: true, fields: ['user_id', 'restaurant_id'] },
        ],
    });

    return UserRestaurant;
};
