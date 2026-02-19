const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Expense = sequelize.define('Expense', {
        expense_id: {
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
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        vendor_name: {
            type: DataTypes.STRING(255),
        },
        invoice_number: {
            type: DataTypes.STRING(100),
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'expenses',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['user_id'] },
            { fields: ['category'] },
            { fields: ['date'] },
        ],
    });

    Expense.associate = (models) => {
        Expense.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
        Expense.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Expense.hasMany(models.Invoice, { foreignKey: 'expense_id', as: 'invoices' });
    };

    return Expense;
};
