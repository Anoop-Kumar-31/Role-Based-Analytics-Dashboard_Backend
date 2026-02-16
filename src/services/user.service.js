const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Restaurant, UserRestaurant, Company } = require('../models');

/**
 * Authenticate user and generate JWT token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User data and access token
 * @throws {Error} If user not found, blocked, or invalid password
 */
exports.authenticateUser = async (email, password) => {
    try {
        // Find user by email
        const user = await User.findOne({
            where: { email, is_active: true },
            attributes: ['user_id', 'email', 'password', 'first_name', 'last_name', 'role', 'company_id', 'is_blocked']
        });

        if (!user) {
            throw new Error('User not found');
        }

        if (user.is_blocked) {
            throw new Error('Account blocked');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                company_id: user.company_id,
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Update last login
        await user.update({ last_login: new Date() });

        return {
            token,
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                company_id: user.company_id,
            }
        };
    } catch (error) {
        console.error('Authenticate user service error:', error);
        throw error;
    }
};

/**
 * Create a new user
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Created user (without password)
 * @throws {Error} If user already exists or creation fails
 */
exports.createUser = async (userData) => {
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password || 'default@123', 10);

        // Create user
        const user = await User.create({
            first_name: userData.first_name,
            last_name: userData.last_name,
            email: userData.email,
            password: hashedPassword,
            phone_number: userData.phone_number,
            role: userData.role || 'Restaurant_Employee',
            company_id: userData.company_id,
        });

        return {
            user_id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            company_id: user.company_id,
        };
    } catch (error) {
        console.error('Create user service error:', error);
        throw error;
    }
};

/**
 * Get all users with optional filters
 * @param {Object} filters - Filter options (company_id, role, userRole, companyId for authorization, pagination)
 * @returns {Promise<Object>} Users array and pagination info
 * @throws {Error} If query fails
 */
exports.getAllUsers = async (filters = {}) => {
    try {
        const { company_id, role, userRole, companyId, page = 1, pageSize = 10 } = filters;

        const where = { is_active: true };

        // Filter by company (unless super admin viewing all)
        if (userRole !== 'Super_Admin') {
            where.company_id = companyId;
        } else if (company_id) {
            where.company_id = company_id;
        }

        if (role) where.role = role;

        const offset = (page - 1) * pageSize;

        const { count, rows } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_name'],
                },
                {
                    model: Restaurant,
                    as: 'restaurants',
                    attributes: ['restaurant_name'],
                },
            ],
        });

        // Transform rows to flatten company_name
        const users = rows.map(user => {
            const userData = user.toJSON();
            return {
                ...userData,
                company_name: userData.company?.company_name || null,
                restaurant_name: userData.restaurants?.map(restaurant => restaurant.restaurant_name) || null,
            };
        });

        return {
            users,
            totalCount: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(count / pageSize),
        };
    } catch (error) {
        console.error('Get all users service error:', error);
        throw error;
    }
};

/**
 * Get user by ID
 * @param {string} user_id - User ID
 * @returns {Promise<Object>} User object (without password)
 * @throws {Error} If user not found
 */
exports.getUserById = async (user_id) => {
    try {
        const user = await User.findOne({
            where: { user_id, is_active: true },
            attributes: { exclude: ['password'] },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('Get user by ID service error:', error);
        throw error;
    }
};

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object>} User object with restaurants (without password)
 * @throws {Error} If user not found
 */
exports.getUserByEmail = async (email) => {
    try {
        const user = await User.findOne({
            where: { email, is_active: true },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: Company,
                    as: 'company',
                    attributes: ['company_name', 'company_id'],
                },
                {
                    model: Restaurant,
                    as: 'restaurants',
                    attributes: ['restaurant_id', 'restaurant_name'],
                },
            ],
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (error) {
        console.error('Get user by email service error:', error);
        throw error;
    }
};

/**
 * Update user
 * @param {string} user_id - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated user (without password)
 * @throws {Error} If user not found
 */
exports.updateUser = async (user_id, updates) => {
    try {
        // Remove fields that shouldn't be updated directly
        delete updates.user_id;
        delete updates.password;

        const user = await User.findOne({ where: { user_id, is_active: true } });

        if (!user) {
            throw new Error('User not found');
        }

        await user.update(updates);

        const updatedUser = await User.findOne({
            where: { user_id },
            attributes: { exclude: ['password'] },
        });

        return updatedUser;
    } catch (error) {
        console.error('Update user service error:', error);
        throw error;
    }
};

/**
 * Delete user (soft delete)
 * @param {string} user_id - User ID
 * @returns {Promise<void>}
 * @throws {Error} If user not found
 */
exports.deleteUser = async (user_id) => {
    try {
        const user = await User.findOne({ where: { user_id } });

        if (!user) {
            throw new Error('User not found');
        }

        await user.update({ is_active: false });
    } catch (error) {
        console.error('Delete user service error:', error);
        throw error;
    }
};

/**
 * Toggle user block status
 * @param {string} user_id - User ID
 * @returns {Promise<Object>} Updated block status
 * @throws {Error} If user not found
 */
exports.toggleBlockUser = async (user_id) => {
    try {
        const user = await User.findOne({ where: { user_id, is_active: true } });

        if (!user) {
            throw new Error('User not found');
        }

        await user.update({ is_blocked: !user.is_blocked });

        return {
            is_blocked: user.is_blocked,
            message: `User ${user.is_blocked ? 'blocked' : 'unblocked'} successfully`
        };
    } catch (error) {
        console.error('Toggle block user service error:', error);
        throw error;
    }
};

/**
 * Get restaurants by user's company
 * @param {string} user_id - User ID
 * @returns {Promise<Array>} Array of restaurants
 * @throws {Error} If user not found
 */
exports.getUserRestaurants = async (user_id) => {
    try {
        if (!user_id) {
            throw new Error('User ID is required');
        }

        // Find the user to get their company_id
        const userCompany = await User.findOne({
            where: { user_id: user_id },
            attributes: ['company_id']
        });

        if (!userCompany) {
            throw new Error('User not found');
        }

        const companyId = userCompany.company_id;

        // Find restaurants associated with that company_id
        const restaurants = await Restaurant.findAll({
            where: {
                company_id: companyId
            },
            attributes: {
                exclude: [
                    "created_at",
                    "created_by",
                    "updated_by",
                ],
            },
        });

        return restaurants;
    } catch (error) {
        console.error('Get user restaurants service error:', error);
        throw error;
    }
};

/**
 * Add user and link to restaurant
 * @param {Object} userData - User data including restaurant_name
 * @param {string} companyId - Company ID from auth context
 * @returns {Promise<Object>} Created user with restaurant info
 * @throws {Error} If restaurant not found or user already exists
 */
exports.addUserWithRestaurant = async (userData, companyId) => {
    try {
        const { user_first_name, user_last_name, user_email, user_phone_no, role, restaurant_name } = userData;

        // Find restaurant to get company_id
        let restaurant;
        if (restaurant_name) {
            const whereClause = {
                restaurant_name,
                is_active: true
            };

            // Only filter by company_id if it exists (not Super Admin)
            if (companyId) {
                whereClause.company_id = companyId;
            }

            restaurant = await Restaurant.findOne({
                where: whereClause
            });
        }

        if (!restaurant) {
            throw new Error('Restaurant not found');
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ where: { email: user_email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Generate default password
        const defaultPassword = 'default@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create user
        const newUser = await User.create({
            first_name: user_first_name,
            last_name: user_last_name,
            email: user_email,
            password: hashedPassword,
            phone_number: user_phone_no,
            role: role,
            company_id: restaurant.company_id,
            is_active: true,
            is_blocked: false
        });

        // Link user to restaurant
        await UserRestaurant.create({
            user_id: newUser.user_id,
            restaurant_id: restaurant.restaurant_id
        });

        return {
            user_id: newUser.user_id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            phone_number: newUser.phone_number,
            role: newUser.role,
            company_id: newUser.company_id,
            is_active: newUser.is_active,
            restaurant: {
                restaurant_id: restaurant.restaurant_id,
                restaurant_name: restaurant.restaurant_name
            },
            default_password: defaultPassword
        };
    } catch (error) {
        console.error('Add user with restaurant service error:', error);
        throw error;
    }
};



exports.getCompanyId = async (user_id) => {
    try {
        const user = await User.findOne({ where: { user_id } });
        if (!user) {
            throw new Error('User not found');
        }
        return user.company_id;
    } catch (error) {
        console.error('Get company ID service error:', error);
        throw error;
    }
};