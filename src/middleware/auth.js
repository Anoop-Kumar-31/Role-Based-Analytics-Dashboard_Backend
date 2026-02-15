const jwt = require('jsonwebtoken');
const { User, UserRestaurant } = require('../models');

// ============================================
// CORE AUTHENTICATION
// ============================================

/**
 * Verify JWT token and attach user info to request
 */
const verifyToken = (req, res, next) => {
    console.log("Verifying Token!!!")
    try {
        const token = req.headers['x-access-token'] || req.headers['authorization']?.split(' ')[1];

        if (!token) {
            return res.status(403).json({
                error: 'No token provided',
                message: 'Access token is required for authentication'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    error: 'Unauthorized',
                    message: 'Invalid or expired token'
                });
            }

            // Attach user info to request
            req.userId = decoded.user_id;
            req.userRole = decoded.role;
            req.companyId = decoded.company_id;
            req.userEmail = decoded.email;
            req.decoded = decoded;
            console.log("Token Verified Successfully!!!")
            next();
        });
    } catch (error) {
        console.log("Token Verification Failed!!!")
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Error verifying token'
        });
    }
};

// ============================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================

/**
 * Check if user is Super Admin
 * Super Admin has access to all platform operations
 */
const isSuperAdmin = (req, res, next) => {
    if (req.userRole !== 'Super_Admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'This action requires Super Admin privileges'
        });
    }
    next();
};

/**
 * Check if user is Company Admin or Super Admin
 * Company Admin can manage their company and its resources
 */
const isCompanyAdmin = (req, res, next) => {
    if (req.userRole !== 'Company_Admin' && req.userRole !== 'Super_Admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'This action requires Company Admin or Super Admin privileges'
        });
    }
    next();
};

/**
 * Check if user has any of the specified roles
 * Usage: hasRole(['Super_Admin', 'Company_Admin'])
 */
const hasRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
            });
        }
        next();
    };
};

// ============================================
// COMPANY SCOPING & OWNERSHIP
// ============================================

/**
 * Check if user belongs to the requested company
 * Super Admin bypasses this check
 * Usage: belongsToCompany() or belongsToCompany('customParamName')
 */
const belongsToCompany = (companyIdParam = 'company_id') => {
    return (req, res, next) => {
        if (req.userRole === 'Super_Admin') {
            return next(); // Super admin can access all companies
        }

        const requestedCompanyId = req.params[companyIdParam] || req.body[companyIdParam] || req.query[companyIdParam];

        if (!requestedCompanyId) {
            return res.status(400).json({
                error: 'Bad Request',
                message: `Missing ${companyIdParam} parameter`
            });
        }

        if (req.companyId !== requestedCompanyId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have access to this company\'s resources'
            });
        }

        next();
    };
};

/**
 * Check if user owns the resource (is the creator)
 * Usage: isResourceOwner('user_id')
 */
const isResourceOwner = (userIdParam = 'user_id') => {
    return (req, res, next) => {
        if (req.userRole === 'Super_Admin') {
            return next(); // Super admin can access all resources
        }

        const resourceUserId = req.params[userIdParam] || req.body[userIdParam];

        if (req.userId !== resourceUserId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only access your own resources'
            });
        }

        next();
    };
};

/**
 * Check if user is the resource owner OR has admin privileges
 * Usage: isOwnerOrAdmin('user_id')
 */
const isOwnerOrAdmin = (userIdParam = 'user_id') => {
    return (req, res, next) => {
        const resourceUserId = req.params[userIdParam] || req.body[userIdParam];
        const isOwner = req.userId === resourceUserId;
        const isAdmin = req.userRole === 'Super_Admin' || req.userRole === 'Company_Admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You must be the resource owner or an admin to perform this action'
            });
        }

        next();
    };
};

// ============================================
// RESTAURANT ACCESS CONTROL
// ============================================

/**
 * Check if user has access to a specific restaurant
 * Super Admin: Access all restaurants
 * Company Admin: Access all restaurants in their company
 * Restaurant Employee: Access only assigned restaurants
 */
const hasRestaurantAccess = (restaurantIdParam = 'restaurant_id') => {
    return async (req, res, next) => {
        try {
            // Super Admin has access to all restaurants
            if (req.userRole === 'Super_Admin') {
                return next();
            }

            const restaurantId = req.params[restaurantIdParam] || req.body[restaurantIdParam] || req.query[restaurantIdParam];

            if (!restaurantId) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: `Missing ${restaurantIdParam} parameter`
                });
            }

            // Company Admin has access to all restaurants in their company
            if (req.userRole === 'Company_Admin') {
                const { Restaurant } = require('../models');
                const restaurant = await Restaurant.findOne({
                    where: { restaurant_id: restaurantId }
                });

                if (!restaurant) {
                    return res.status(404).json({
                        error: 'Not Found',
                        message: 'Restaurant not found'
                    });
                }

                if (restaurant.company_id !== req.companyId) {
                    return res.status(403).json({
                        error: 'Forbidden',
                        message: 'This restaurant does not belong to your company'
                    });
                }

                return next();
            }

            // Restaurant Employee: Check user_restaurants table
            const userRestaurant = await UserRestaurant.findOne({
                where: {
                    user_id: req.userId,
                    restaurant_id: restaurantId
                }
            });

            if (!userRestaurant) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have access to this restaurant'
                });
            }

            next();
        } catch (error) {
            console.error('hasRestaurantAccess error:', error);
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Error checking restaurant access'
            });
        }
    };
};

// ============================================
// PERMISSION-BASED CHECKS
// ============================================

/**
 * Permission definitions mapped to roles
 * This provides granular control over what each role can do
 */
const PERMISSIONS = {
    // Company Management
    'company:view': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'company:create': ['Super_Admin'],
    'company:update': ['Super_Admin', 'Company_Admin'],
    'company:delete': ['Super_Admin'],
    'company:approve': ['Super_Admin'],

    // User Management
    'user:view': ['Super_Admin', 'Company_Admin'],
    'user:create': ['Super_Admin', 'Company_Admin'],
    'user:update': ['Super_Admin', 'Company_Admin'],
    'user:delete': ['Super_Admin', 'Company_Admin'],
    'user:manage_roles': ['Super_Admin', 'Company_Admin'],

    // Restaurant Management
    'restaurant:view': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'restaurant:create': ['Super_Admin', 'Company_Admin'],
    'restaurant:update': ['Super_Admin', 'Company_Admin'],
    'restaurant:delete': ['Super_Admin', 'Company_Admin'],

    // Revenue Operations
    'revenue:view': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'revenue:create': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'revenue:update': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'revenue:delete': ['Super_Admin', 'Company_Admin'],

    // Expense Operations
    'expense:view': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'expense:create': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'expense:update': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'expense:delete': ['Super_Admin', 'Company_Admin'],

    // Blue Book Operations
    'bluebook:view': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'bluebook:create': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'bluebook:update': ['Super_Admin', 'Company_Admin', 'Restaurant_Employee'],
    'bluebook:delete': ['Super_Admin', 'Company_Admin'],

    // Analytics & Reports
    'analytics:view': ['Super_Admin', 'Company_Admin'],
    'reports:export': ['Super_Admin', 'Company_Admin'],
};

/**
 * Check if user has a specific permission
 * Usage: hasPermission('revenue:create')
 */
const hasPermission = (permission) => {
    return (req, res, next) => {
        const allowedRoles = PERMISSIONS[permission];

        if (!allowedRoles) {
            console.warn(`⚠️  Unknown permission: ${permission}`);
            return res.status(500).json({
                error: 'Internal server error',
                message: 'Permission configuration error'
            });
        }

        if (!allowedRoles.includes(req.userRole)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `You do not have permission to perform this action (${permission})`
            });
        }

        next();
    };
};

/**
 * Check if user has ANY of the specified permissions (OR logic)
 * Usage: hasAnyPermission(['revenue:view', 'revenue:create'])
 */
const hasAnyPermission = (permissions) => {
    return (req, res, next) => {
        const hasAccess = permissions.some(permission => {
            const allowedRoles = PERMISSIONS[permission];
            return allowedRoles && allowedRoles.includes(req.userRole);
        });

        if (!hasAccess) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `You do not have any of the required permissions: ${permissions.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Check if user has ALL of the specified permissions (AND logic)
 * Usage: hasAllPermissions(['revenue:view', 'revenue:create'])
 */
const hasAllPermissions = (permissions) => {
    return (req, res, next) => {
        const hasAllAccess = permissions.every(permission => {
            const allowedRoles = PERMISSIONS[permission];
            return allowedRoles && allowedRoles.includes(req.userRole);
        });

        if (!hasAllAccess) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `You must have all of these permissions: ${permissions.join(', ')}`
            });
        }

        next();
    };
};

// ============================================
// ACCOUNT STATUS CHECKS
// ============================================

/**
 * Check if user account is active and not blocked
 */
const isActiveUser = async (req, res, next) => {
    try {
        const user = await User.findOne({
            where: { user_id: req.userId },
            attributes: ['is_active', 'is_blocked']
        });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Your user account no longer exists'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                error: 'Account Inactive',
                message: 'Your account has been deactivated'
            });
        }

        if (user.is_blocked) {
            return res.status(403).json({
                error: 'Account Blocked',
                message: 'Your account has been blocked. Please contact support.'
            });
        }

        next();
    } catch (error) {
        console.error('isActiveUser error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: 'Error checking user status'
        });
    }
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
    // Core Authentication
    verifyToken,
    isActiveUser,

    // Role-Based Checks
    isSuperAdmin,
    isCompanyAdmin,
    hasRole,

    // Ownership & Scoping
    belongsToCompany,
    isResourceOwner,
    isOwnerOrAdmin,

    // Restaurant Access
    hasRestaurantAccess,

    // Permission-Based Checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    PERMISSIONS, // Export for reference

    // Utility
    requireAuth: verifyToken, // Alias for clarity
};
