const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Restaurant, UserRestaurant, Company } = require('../models');

// Sign in user
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({
            where: { email, is_active: true },
            attributes: ['user_id', 'email', 'password', 'first_name', 'last_name', 'role', 'company_id', 'is_blocked']
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this email'
            });
        }

        if (user.is_blocked) {
            return res.status(403).json({
                error: 'Account blocked',
                message: 'Your account has been blocked. Please contact support.'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Incorrect password'
            });
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

        res.json({
            data: {
                message: 'Login successful',
                accessToken: token,
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    company_id: user.company_id,
                }
            }
        });

    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error during sign in'
        });
    }
};

//Create user
exports.createUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, phone_number, role, company_id } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                error: 'User exists',
                message: 'A user with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password || 'default@123', 10);

        // Create user
        const user = await User.create({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            phone_number,
            role: role || 'Restaurant_Employee',
            company_id,
        });

        res.status(201).json({
            message: 'User created successfully',
            user: {
                user_id: user.user_id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                company_id: user.company_id,
            }
        });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error creating user'
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { company_id, role, page = 1, pageSize = 10 } = req.query;

        const where = { is_active: true };

        // Filter by company (unless super admin viewing all)
        if (req.userRole !== 'Super_Admin') {
            where.company_id = req.companyId;
        } else if (company_id) {
            where.company_id = company_id;
        }

        if (role) where.role = role;

        const offset = (page - 1) * pageSize;

        //add company name by accesing company model using company_id in response
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
            ],
        });

        // Transform rows to flatten company_name
        const users = rows.map(user => {
            const userData = user.toJSON();
            return {
                ...userData,
                company_name: userData.company?.company_name || null,
                company: undefined // Remove nested company object
            };
        });

        res.json({
            data: {
                users: users,
                totalCount: count,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
                totalPages: Math.ceil(count / pageSize),
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching users'
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findOne({
            where: { user_id, is_active: true },
            attributes: { exclude: ['password'] },
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this ID'
            });
        }

        res.json({ user });

    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching user'
        });
    }
};

// Update user
exports.updateUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates.user_id;
        delete updates.password;
        delete updates.role; // Role changes should be done separately

        const user = await User.findOne({ where: { user_id, is_active: true } });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this ID'
            });
        }

        await user.update(updates);

        const updatedUser = await User.findOne({
            where: { user_id },
            attributes: { exclude: ['password'] },
        });

        res.json({
            message: 'User updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error updating user'
        });
    }
};

// Delete user (soft delete)
exports.deleteUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findOne({ where: { user_id } });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with this ID'
            });
        }

        await user.update({ is_active: false });

        res.json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting user'
        });
    }
};

// Block/Unblock user
exports.toggleBlockUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findOne({ where: { user_id, is_active: true } });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this ID'
            });
        }

        await user.update({ is_blocked: !user.is_blocked });

        res.json({
            message: `User ${user.is_blocked ? 'blocked' : 'unblocked'} successfully`,
            is_blocked: user.is_blocked
        });

    } catch (error) {
        console.error('Toggle block user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error toggling user block status'
        });
    }
};


exports.getUserRestaurants = async (req, res) => {
    try {
        const { user_id } = req.params;

        if (!user_id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // 1. Find the user to get their company_id
        console.log("🔴 finding user's company");
        const userCompany = await User.findOne({
            where: { user_id: user_id },
            attributes: ['company_id']
        });

        // 2. Check if the user was found
        if (!userCompany) {
            throw new Error("User not found"); // Throw error if user doesn't exist
        }

        // Extract the actual company_id value
        const companyId = userCompany.company_id; // Correctly access the attribute

        // 3. Find restaurants associated with that company_id
        console.log("🔴 finding all restaurants under user's company");
        const restaurants = await Restaurant.findAll({
            where: {
                company_id: companyId // Use the extracted company ID
            },
            attributes: {
                exclude: [
                    "created_at",
                    "created_by",
                    "updated_by",
                ],
            },
        });

        console.log(restaurants, "\n\n\n\n")
        return res.status(200).json({ message: "Fetched restaurants", restaurants });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};



// {
//     "user_first_name": "Anoop",
//     "user_last_name": "Kumar",
//     "role": "Restaurant_Employee",
//     "restaurant_name": "Amit's Restaurant",
//     "user_phone_no": "07985345837",
//     "user_email": "amt312002@gmail.com"
// }
exports.addUser = async (req, res) => {
    try {
        const { user_first_name, user_last_name, user_email, user_phone_no, role, restaurant_name } = req.body;

        // Find restaurant to get company_id
        let restaurant;
        if (restaurant_name) {
            restaurant = await Restaurant.findOne({
                where: { restaurant_name, is_active: true }
            });
        } else if (restaurant_name) {
            // If restaurant_name is provided, find by name
            // This assumes the logged-in user's company context
            restaurant = await Restaurant.findOne({
                where: {
                    restaurant_name,
                    company_id: req.companyId, // From auth middleware
                    is_active: true
                }
            });
        }

        if (!restaurant) {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with the provided information'
            });
        }

        // Check if user with this email already exists
        const existingUser = await User.findOne({ where: { email: user_email } });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }

        // Generate default password (can be changed later by user)
        const defaultPassword = 'Welcome@123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Create user with proper field mapping
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

        // Return user without password
        const userResponse = {
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
            default_password: defaultPassword // Send this once so admin can share with user
        };

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create user',
            details: error.message
        });
    }
};