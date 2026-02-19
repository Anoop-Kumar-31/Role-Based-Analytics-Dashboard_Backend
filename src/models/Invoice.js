const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Invoice = sequelize.define('Invoice', {
        invoice_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        expense_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        sales_category_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.FLOAT,
            defaultValue: 1,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        tax_price: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        created_by: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'invoices',
        timestamps: true,
        underscored: true,
    });

    Invoice.associate = (models) => {
        Invoice.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Invoice.belongsTo(models.Expense, { foreignKey: 'expense_id', as: 'expense' });
        Invoice.belongsTo(models.SalesCategory, { foreignKey: 'sales_category_id', as: 'salesCategory' });
    };

    return Invoice;
};
