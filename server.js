require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const db = require('./src/models');
const cron = require('node-cron');
const app = express();
const PORT = process.env.PORT || 8080;
const isProd = process.env.NODE_ENV === 'production';

// Trust proxy for secure cookies and accurate IP addresses in production
if (isProd) {
    app.set('trust proxy', 1);
}


// Security middleware
app.use(helmet());

// CORS configuration for free hosting
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:3000',
            process.env.FRONTEND_URL
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
// Also pings the DB so Supabase connection pool wakes up alongside the server
app.get('/health', async (req, res) => {
    try {
        await db.sequelize.query('SELECT 1');
        res.status(200).json({
            server_status: 'ok',
            db_status: 'available and connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (err) {
        res.status(200).json({
            server_status: 'ok',
            db_status: 'unavailable and not connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    }
});

// Runs every 5 days at midnight — prevents Supabase free-tier pause (7-day inactivity limit)
cron.schedule('0 0 */5 * *', async () => {
    try {
        await db.sequelize.query('SELECT 1');
        console.log('✅ [Cron] Supabase keep-alive ping successful');
    } catch (err) {
        console.error('❌ [Cron] Supabase keep-alive ping failed:', err.message);
    }
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

const dashboardRoutes = require('./src/routes/dashboard.routes');
app.use('/api/v1/dashboard', dashboardRoutes);

// Note: Revenue routes are under /api/v1/restaurants/* path
// This maintains backward compatibility with existing frontend

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'RBAC_Dashboard API - Free Forever Edition',
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

const { createSuperAdmin } = require('./src/seeders/createSuperAdmin');
const { seedDemoData } = require('./src/seeders/demoSeeder');

const startServer = async () => {
    try {
        // Test database connection
        await db.sequelize.authenticate();
        console.log('✅ Database connected successfully');

        if (!isProd) {
            console.log(`📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
        }

        // Sync models (always in development, only if requested or if tables missing in production)
        // For production, we'll sync but without { alter: true } by default unless FORCE_DB_SYNC is set
        const syncOptions = {
            alter: process.env.NODE_ENV === 'development' || process.env.FORCE_DB_SYNC === 'true'
        };

        await db.sequelize.sync(syncOptions);
        console.log('✅ Database models synchronized');

        // Create super admin and seed demo data after sync
        await createSuperAdmin();
        await seedDemoData();

        // Start server only if not already running
        if (!server) {
            server = app.listen(PORT, () => {
                const protocol = isProd ? 'https' : 'http';
                const host = isProd ? (process.env.RENDER_EXTERNAL_HOSTNAME || 'production-server') : 'localhost';

                console.log(`\n🚀 Server running on port ${PORT}`);
                console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
                if (!isProd) {
                    console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
                    console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
                } else {
                    console.log(`🔗 API Base: /api/v1`);
                    console.log(`❤️  Status: Online\n`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
};

startServer();

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down gracefully...');
    if (server) {
        server.close(async () => {
            console.log('📡 HTTP server closed.');
            try {
                await db.sequelize.close();
                console.log('🗄️  Database connection closed.');
                process.exit(0);
            } catch (err) {
                console.error('❌ Error during database shutdown:', err);
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

module.exports = app;
