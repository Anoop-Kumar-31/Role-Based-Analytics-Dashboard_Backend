const config = require("../../config/config.json");
const Sequelize = require("sequelize");
// Logger not available in this context yet, using console
// const { logger } = require("../logger/logger.js");

console.log("Initializing Sequelize...");

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: dbConfig.dialect,
        logging: false, // console.log
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);

const db = {};

// Assign Sequelize and the sequelize instance to the db object
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize your models and assign them to the db object

// Core Models
db.User = require("./User.js")(sequelize, Sequelize);
db.Company = require("./Company.js")(sequelize, Sequelize);

// Restaurant and Related
db.Restaurant = require("./Restaurant.js")(sequelize, Sequelize);
db.UserRestaurant = require("./UserRestaurant.js")(sequelize, Sequelize);

// Blue Book and Related Comments
db.BlueBook = require("./BlueBook.js")(sequelize, Sequelize);
db.Revenue = require("./Revenue.js")(sequelize, Sequelize);
db.Expense = require("./Expense.js")(sequelize, Sequelize);

// Restaurant Operations & Targets
db.Pos = require("./Pos.js")(sequelize, Sequelize);
db.Forecast = require("./Forecast.js")(sequelize, Sequelize);
db.Target = require("./Target.js")(sequelize, Sequelize);
db.SalesCategory = require("./SalesCategory.js")(sequelize, Sequelize);



// === Call .associate() if available ===
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        console.log(`Associating model: ${modelName}`);
        db[modelName].associate(db);
    }
});

// Export the db object
module.exports = db;
