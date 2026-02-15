const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const db = {};

// Read all model files
fs
    .readdirSync(__dirname)
    .filter(file => {
        return (
            file.indexOf('.') !== 0 &&
            file !== 'index.js' &&
            file.slice(-3) === '.js'
        );
    })
    .forEach(file => {
        const model = require(path.join(__dirname, file))(sequelize);
        db[model.name] = model;
    });

// Setup associations
Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Define associations
if (db.User && db.Company) {
    db.User.belongsTo(db.Company, { foreignKey: 'company_id', as: 'company' });
    db.Company.hasMany(db.User, { foreignKey: 'company_id', as: 'users' });
}

if (db.User && db.Restaurant && db.UserRestaurant) {
    db.User.belongsToMany(db.Restaurant, {
        through: db.UserRestaurant,
        foreignKey: 'user_id',
        as: 'restaurants'
    });
    db.Restaurant.belongsToMany(db.User, {
        through: db.UserRestaurant,
        foreignKey: 'restaurant_id',
        as: 'users'
    });
}

if (db.Restaurant && db.Company) {
    db.Restaurant.belongsTo(db.Company, { foreignKey: 'company_id', as: 'company' });
    db.Company.hasMany(db.Restaurant, { foreignKey: 'company_id', as: 'restaurants' });
}

if (db.Revenue && db.Restaurant) {
    db.Revenue.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasMany(db.Revenue, { foreignKey: 'restaurant_id', as: 'revenues' });
}

if (db.Revenue && db.User) {
    db.Revenue.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
    db.User.hasMany(db.Revenue, { foreignKey: 'user_id', as: 'revenues' });
}

if (db.Expense && db.Restaurant) {
    db.Expense.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasMany(db.Expense, { foreignKey: 'restaurant_id', as: 'expenses' });
}

if (db.Expense && db.User) {
    db.Expense.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
    db.User.hasMany(db.Expense, { foreignKey: 'user_id', as: 'expenses' });
}

if (db.BlueBook && db.Restaurant) {
    db.BlueBook.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasMany(db.BlueBook, { foreignKey: 'restaurant_id', as: 'blueBooks' });
}

if (db.BlueBook && db.User) {
    db.BlueBook.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
    db.User.hasMany(db.BlueBook, { foreignKey: 'user_id', as: 'blueBooks' });
}

// POS associations
if (db.Pos && db.Restaurant) {
    db.Pos.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasOne(db.Pos, { foreignKey: 'restaurant_id', as: 'pos' });
}

// Forecast associations
if (db.Forecast && db.Restaurant) {
    db.Forecast.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasMany(db.Forecast, { foreignKey: 'restaurant_id', as: 'forecasts' });
}

// Target associations
if (db.Target && db.Restaurant) {
    db.Target.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasMany(db.Target, { foreignKey: 'restaurant_id', as: 'targets' });
}

// SalesCategory associations
if (db.SalesCategory && db.Restaurant) {
    db.SalesCategory.belongsTo(db.Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    db.Restaurant.hasMany(db.SalesCategory, { foreignKey: 'restaurant_id', as: 'salesCategories' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
