const { Sequelize } = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV || "development";

let sequelize;

if (env === "production") {
    const DATABASE_URL = process.env.DATABASE_URL;

    if (!DATABASE_URL) {
        throw new Error("❌ DATABASE_URL missing in production");
    }

    sequelize = new Sequelize(DATABASE_URL, {
        dialect: "postgres",

        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false,
            },
        },

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },

        logging: false,
    });

} else {
    // Development: Use individual credentials
    sequelize = new Sequelize({
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    });
}

module.exports = sequelize;
