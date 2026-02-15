require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const db = require('./src/models');

const app = express();
const PORT = process.env.PORT || 8080;


// Security middleware
app.use(helmet());

// CORS configuration for free hosting
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            process.env.FRONTEND_URL,
            /\.vercel\.app$/,  // Allow all Vercel deployments
            /\.netlify\.app$/,  // Allow all Netlify deployments
        ];

        if (!origin || allowedOrigins.some(allowed => {
            if (allowed instanceof RegExp) return allowed.test(origin);
            return allowed === origin;
        })) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
};

app.use(cors(corsOptions));

// Compression for better performance on free tier
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Health check endpoint (important for Render free tier to prevent sleep)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api/v1', require('./src/routes'));

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'GetBreadCrumbs API - Free Forever Edition',
        version: '1.0.0',
        endpoints: '/api/v1',
        health: '/health',
        database: process.env.NODE_ENV === 'production' ? 'Supabase PostgreSQL' : 'Local PostgreSQL'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        availableEndpoints: '/api/v1'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Database connection and server start
const startServer = async () => {
    try {
        // Test database connection
        await db.sequelize.authenticate();
        console.log('✅ Database connected successfully');
        console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);

        // Sync models (use migrations in production)
        if (process.env.NODE_ENV === 'development') {
            await db.sequelize.sync({ alter: false });
            console.log('✅ Database models synchronized');
        }

        // Start server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
            console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
        });

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

// Handle shutdown gracefully (important for Render)
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Closing server gracefully...');
    await db.sequelize.close();
    process.exit(0);
});


// Create super_admin if not exists

const { createSuperAdmin } = require('./src/seeders/createSuperAdmin');
createSuperAdmin();

startServer();

module.exports = app;
