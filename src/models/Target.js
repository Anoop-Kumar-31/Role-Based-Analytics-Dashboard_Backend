const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Target = sequelize.define('Target', {
        target_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 12,
            },
        },
        // Labor Targets
        overall_labor_target: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Overall labor target percentage',
        },
        foh_target: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Front of house labor target percentage',
        },
        boh_target: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Back of house labor target percentage',
        },
        foh_combined_salaried: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'FOH salaried employees total',
        },
        boh_combined_salaried: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
            comment: 'BOH salaried employees total',
        },
        other_combined_salaried: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        includes_salaries: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        // COGS Targets (by category)
        cogs_target: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Overall COGS target percentage',
        },
        food: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Food COGS target percentage',
        },
        pastry: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        beer: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        wine: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        liquor: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        NA_Bev: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
            comment: 'Non-alcoholic beverage COGS',
        },
        smallwares: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        others: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        prime_percentage: {
            type: DataTypes.DECIMAL(5, 2),
            comment: 'Prime cost percentage (Labor + COGS)',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'targets',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['year', 'month'] },
            { unique: true, fields: ['restaurant_id', 'year', 'month'] },
        ],
    });

    return Target;
};
