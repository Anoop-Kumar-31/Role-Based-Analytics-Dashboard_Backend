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

// API routes - Modular routing
const userRoutes = require('./src/routes/user.routes');
const companyRoutes = require('./src/routes/company.routes');
const restaurantRoutes = require('./src/routes/restaurant.routes');
const revenueRoutes = require('./src/routes/revenue.routes');
const expenseRoutes = require('./src/routes/expense.routes');
const blueBookRoutes = require('./src/routes/blueBook.routes');
const onboardingRoutes = require('./src/routes/onboarding.routes');
const roleRoutes = require('./src/routes/role.routes');
const locationRoutes = require('./src/routes/location.routes');

// Register routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/companies', companyRoutes);
app.use('/api/v1/restaurants', restaurantRoutes);
app.use('/api/v1/restaurants', revenueRoutes); // Revenue routes nested under /restaurants
app.use('/api/v1/expense', expenseRoutes);
app.use('/api/v1/blue-book', blueBookRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/location', locationRoutes);

// Note: Revenue routes are under /api/v1/restaurants/* path
// This maintains backward compatibility with existing frontend

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
let server; // Store server reference for graceful shutdown

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

        // Start server only if not already running
        if (!server) {
            server = app.listen(PORT, () => {
                console.log(`\n🚀 Server running on port ${PORT}`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
                console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
                console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
            });
        }

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);

    if (server) {
        server.close(async () => {
            console.log('✅ HTTP server closed');

            try {
                await db.sequelize.close();
                console.log('✅ Database connection closed');
                process.exit(0);
            } catch (error) {
                console.error('❌ Error closing database:', error);
                process.exit(1);
            }
        });

        // Force close after 10 seconds
        setTimeout(() => {
            console.error('⚠️  Forced shutdown after timeout');
            process.exit(1);
        }, 10000);
    } else {
        process.exit(0);
    }
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C


// Create super_admin if not exists

const { createSuperAdmin } = require('./src/seeders/createSuperAdmin');
createSuperAdmin();

startServer();

module.exports = app;
