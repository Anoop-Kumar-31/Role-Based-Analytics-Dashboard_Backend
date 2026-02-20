const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const BlueBook = sequelize.define('BlueBook', {
        blue_book_id: {
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
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        weather: {
            type: DataTypes.STRING(100),
        },
        // Sales Data
        breakfast_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        breakfast_guests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        lunch_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        lunch_guests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        dinner_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        dinner_guests: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        total_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        total_sales_last_year: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Food & Beverage
        food_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        lbw_sales: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        // Labor
        hourly_labor: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        hourly_labor_percent: {
            type: DataTypes.DECIMAL(5, 2),
            defaultValue: 0,
        },
        hours_worked: {
            type: DataTypes.DECIMAL(8, 2),
            defaultValue: 0,
        },
        splh: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0,
        },
        notes_data: {
            type: DataTypes.JSON,
            defaultValue: {},
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'blue_books',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['date'] },
            { unique: true, fields: ['restaurant_id', 'date'] },
        ],
    });

    BlueBook.associate = (models) => {
        BlueBook.belongsTo(models.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
        BlueBook.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });

        // Conditional associations for sub-resources
        if (models.Smwe) BlueBook.hasMany(models.Smwe, { foreignKey: 'blue_book_id', as: 'smwes' });
        if (models.Item86) BlueBook.hasMany(models.Item86, { foreignKey: 'blue_book_id', as: 'item86s' });
        if (models.Win) BlueBook.hasMany(models.Win, { foreignKey: 'blue_book_id', as: 'wins' });
        if (models.Miss) BlueBook.hasMany(models.Miss, { foreignKey: 'blue_book_id', as: 'misses' });
        if (models.StaffNote) BlueBook.hasMany(models.StaffNote, { foreignKey: 'blue_book_id', as: 'staffNotes' });
        if (models.MaintenanceIssue) BlueBook.hasMany(models.MaintenanceIssue, { foreignKey: 'blue_book_id', as: 'maintenanceIssues' });
        if (models.MiscNote) BlueBook.hasMany(models.MiscNote, { foreignKey: 'blue_book_id', as: 'miscNotes' });
        if (models.CallOut) BlueBook.hasMany(models.CallOut, { foreignKey: 'blue_book_id', as: 'callOuts' });
    };

    return BlueBook;
};
