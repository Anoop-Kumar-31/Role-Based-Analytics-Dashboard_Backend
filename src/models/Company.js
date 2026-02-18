const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Company = sequelize.define('Company', {
        company_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        company_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        company_email: {
            type: DataTypes.STRING(255),
            validate: {
                isEmail: true,
            },
        },
        company_phone: {
            type: DataTypes.STRING(20),
        },
        number_of_restaurants: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        is_onboarded: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    }, {
        tableName: 'companies',
        timestamps: true,
        indexes: [
            { fields: ['is_onboarded'] },
            { fields: ['is_active'] },
        ],
    });

    Company.associate = (models) => {
        Company.hasMany(models.User, { foreignKey: 'company_id', as: 'users' });
        Company.hasMany(models.Restaurant, { foreignKey: 'company_id', as: 'restaurants' });
    };

    return Company;
};
