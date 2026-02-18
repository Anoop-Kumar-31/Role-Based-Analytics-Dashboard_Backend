const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        phone_number: {
            type: DataTypes.STRING(20),
        },
        role: {
            type: DataTypes.ENUM('Super_Admin', 'Company_Admin', 'Restaurant_Employee'),
            defaultValue: 'Restaurant_Employee',
        },
        company_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_blocked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        last_login: {
            type: DataTypes.DATE,
        },
    }, {
        tableName: 'users',
        timestamps: true,
        indexes: [
            { fields: ['email'] },
            { fields: ['company_id'] },
            { fields: ['role'] },
        ],
    });

    User.associate = (models) => {
        User.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
        User.belongsToMany(models.Restaurant, {
            through: models.UserRestaurant,
            foreignKey: 'user_id',
            as: 'restaurants'
        });
        User.hasMany(models.Revenue, { foreignKey: 'user_id', as: 'revenues' });
        User.hasMany(models.Expense, { foreignKey: 'user_id', as: 'expenses' });
        User.hasMany(models.BlueBook, { foreignKey: 'user_id', as: 'blueBooks' });
    };

    return User;
};
