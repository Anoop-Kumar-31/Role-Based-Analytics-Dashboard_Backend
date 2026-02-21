const bcrypt = require('bcrypt');
const { User } = require('../models');

// Create default super admin user
const createSuperAdmin = async () => {
    try {
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'superAdmin@dashboard.com';
        const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

        if (!superAdminPassword) {
            console.log('ℹ️  Super Admin password not found');
            return;
        }

        // Check if super admin already exists
        const existingAdmin = await User.findOne({
            where: { email: superAdminEmail }
        });

        if (existingAdmin) {
            console.log('ℹ️  Super Admin already exists');
            return existingAdmin;
        }

        // Create super admin
        const superAdmin = await User.create({
            first_name: 'Super',
            last_name: 'Admin',
            email: superAdminEmail,
            password: superAdminPassword,
            phone_number: '0000000000',
            role: 'Super_Admin',
            company_id: null,
            is_active: true,
            is_blocked: false,
        });

        console.log('✅ Super Admin created successfully');
        console.log(`   Email: ${superAdminEmail}`);
        console.log(`   Role: Super_Admin`);

        return superAdmin;

    } catch (error) {
        console.error('❌ Error creating Super Admin:', error.message);
        throw error;
    }
};

module.exports = { createSuperAdmin };
