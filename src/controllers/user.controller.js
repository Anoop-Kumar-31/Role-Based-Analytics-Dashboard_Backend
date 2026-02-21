const userService = require('../services/user.service');
const userRestaurantsService = require('../services/user_restaurants.service');

// Sign in user
exports.signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Call service layer
        const result = await userService.authenticateUser(email, password);

        res.json({
            data: {
                message: 'Login successful',
                accessToken: result.token,
                user: result.user
            }
        });

    } catch (error) {
        console.error('Signin error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this email'
            });
        }

        if (error.message === 'Account blocked') {
            return res.status(403).json({
                error: 'Account blocked',
                message: 'Your account has been blocked. Please contact support.'
            });
        }

        if (error.message === 'Invalid password') {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Incorrect password'
            });
        }

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

        // Call service layer
        const user = await userService.createUser({
            first_name,
            last_name,
            email,
            password,
            phone_number,
            role,
            company_id,
        });

        res.status(201).json({
            message: 'User created successfully',
            user
        });

    } catch (error) {
        console.error('Create user error:', error);

        if (error.message === 'User already exists') {
            return res.status(400).json({
                error: 'User exists',
                message: 'A user with this email already exists'
            });
        }

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

        // Prepare filters for service layer
        const filters = {
            company_id,
            role,
            page,
            pageSize,
            userRole: req.userRole,
            companyId: req.companyId
        };

        // Call service layer
        const result = await userService.getAllUsers(filters);

        res.json({
            data: result
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

        // Call service layer
        const user = await userService.getUserById(user_id);

        res.json({ user });

    } catch (error) {
        console.error('Get user error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching user'
        });
    }
};

// Get user by email
exports.getUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Email query parameter is required'
            });
        }

        // Call service layer
        const user = await userService.getUserByEmail(email);

        res.json({
            message: 'User retrieved successfully',
            user
        });

    } catch (error) {
        console.error('Get user by email error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with this email'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error retrieving user'
        });
    }
};

// Update user
// user_id in parameter
// {
//     "user_first_name": "Anoop",
//     "user_last_name": "Kumar",
//     "role": "Restaurant_Employee",
//     "restaurant_name": [
//         "Amit's Restaurant"
//     ],
//     "user_phone_no": "07985345869",
//     "user_email": "amt312002@gmail.com"
// }

// convert to this
//     {
//         "first_name": "Anoop",
//         "last_name": "Kumar",
//         "email": "amt312002@gmail.com",
//         "phone_number": "07985345837",
//         "role": "Restaurant_Employee",
//     }

// then update in userRestaurants too first find restaurant id then repalce with exisiting restaurant id in this table

exports.updateUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const updates = {};
        const fieldMapping = {
            user_first_name: 'first_name',
            user_last_name: 'last_name',
            user_email: 'email',
            user_phone_no: 'phone_number',
            role: 'role',
            restaurant_name: 'restaurant_name',
            company_id: 'company_id',
            is_active: 'is_active'
        };

        Object.keys(fieldMapping).forEach(key => {
            if (req.body[key] !== undefined) {
                updates[fieldMapping[key]] = req.body[key];
            }
        });

        if (req.userId === user_id || req.userRole === 'Company_Admin') {
            updates.password = req.body.password;
        }

        // Call service layer
        const user = await userService.updateUser(user_id, updates);

        // now update in userRestaurants too first find restaurant id then repalce with exisiting restaurant id in this table
        const userRestaurants = await userRestaurantsService.updateUserRestaurants(user_id, updates);

        res.json({
            message: 'User updated successfully',
            user,
            userRestaurants
        });

    } catch (error) {
        console.error('Update user error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this ID'
            });
        }

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

        // Call service layer
        await userService.deleteUser(user_id);

        res.json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No user found with this ID'
            });
        }

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

        // Call service layer
        const result = await userService.toggleBlockUser(user_id);

        res.json(result);

    } catch (error) {
        console.error('Toggle block user error:', error);

        if (error.message === 'User not found') {
            return res.status(404).json({
                error: 'User not found',
                message: 'No active user found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error toggling user block status'
        });
    }
};


exports.getUserRestaurants = async (req, res) => {
    try {
        const { user_id } = req.params;

        // Call service layer
        const restaurants = await userService.getUserRestaurants(user_id);

        return res.status(200).json({ message: "Fetched restaurants", restaurants });
    } catch (error) {
        console.error('Get user restaurants error:', error);

        if (error.message === 'User ID is required' || error.message === 'User not found') {
            return res.status(400).json({ message: error.message });
        }

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

        // Call service layer
        const userResponse = await userService.addUserWithRestaurant({
            user_first_name,
            user_last_name,
            user_email,
            user_phone_no,
            role,
            restaurant_name
        }, req.companyId);

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Add user error:', error);

        if (error.message === 'Restaurant not found') {
            return res.status(404).json({
                error: 'Restaurant not found',
                message: 'No active restaurant found with the provided information'
            });
        }

        if (error.message === 'User already exists') {
            return res.status(400).json({
                error: 'User already exists',
                message: 'A user with this email already exists'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create user',
            details: error.message
        });
    }
};