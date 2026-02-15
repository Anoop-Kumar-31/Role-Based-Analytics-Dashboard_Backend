const bcrypt = require('bcrypt');
const { User } = require('../models');

// Create default super admin user
const createSuperAdmin = async () => {
    try {
        const superAdminEmail = 'superAdmin@dashboard.com';

        // Check if super admin already exists
        const existingAdmin = await User.findOne({
            where: { email: superAdminEmail }
        });

        if (existingAdmin) {
            console.log('ℹ️  Super Admin already exists');
            return existingAdmin;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('super@admin', 10);

        // Create super admin
        const superAdmin = await User.create({
            first_name: 'Super',
            last_name: 'Admin',
            email: superAdminEmail,
            password: hashedPassword,
            phone_number: '0000000000',
            role: 'Super_Admin',
            company_id: null,
            is_active: true,
            is_blocked: false,
        });

        console.log('✅ Super Admin created successfully');
        console.log(`   Email: ${superAdminEmail}`);
        console.log(`   Password: super@admin`);
        console.log(`   Role: Super_Admin`);

        return superAdmin;

    } catch (error) {
        console.error('❌ Error creating Super Admin:', error.message);
        throw error;
    }
};

module.exports = { createSuperAdmin };
