const { Sequelize } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';

let sequelize;

if (env === 'production') {
    // Production: Use DATABASE_URL from Supabase/Neon
    const DATABASE_URL = process.env.DATABASE_URL ||
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    sequelize = new Sequelize(DATABASE_URL, {
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false, // Required for Supabase/Neon
            },
        },
        pool: {
            max: 5,       // Max connections (free tier limit)
            min: 0,       // Min connections
            acquire: 30000, // Max time to get connection
            idle: 10000,    // Max idle time before release
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
