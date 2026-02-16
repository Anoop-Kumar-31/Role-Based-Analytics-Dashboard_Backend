const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// User validation rules
// {
//     "user_first_name": "Anoop",
//     "user_last_name": "Kumar",
//     "role": "Restaurant_Employee",
//     "restaurant_name": "Amit's Restaurant",
//     "user_phone_no": "07985345837",
//     "user_email": "amt312002@gmail.com"
// }
const validateUserSignup = [
    body('user_email').isEmail().withMessage('Valid email is required'),
    body('user_first_name').notEmpty().withMessage('First name is required'),
    body('user_last_name').notEmpty().withMessage('Last name is required'),
    body('user_phone_no').isMobilePhone().withMessage('Valid phone number is required'),
    body('role').notEmpty().withMessage('Role is required'),
    body('restaurant_name').notEmpty().withMessage('Restaurant name is required'),
    handleValidationErrors
];

const validateUserSignin = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

// Company validation rules
const validateCompany = [
    body('company_name').notEmpty().withMessage('Company name is required'),
    body('number_of_restaurants').optional().isInt({ min: 0 }).withMessage('Number of restaurants must be a positive integer'),
    handleValidationErrors
];

// Restaurant validation rules
const validateRestaurant = [
    body('restaurant_name').notEmpty().withMessage('Restaurant name is required'),
    body('company_id').isUUID().withMessage('Valid company ID is required'),
    handleValidationErrors
];

// Revenue validation rules
const validateRevenue = [
    body('beginning_date').isDate().withMessage('Valid beginning date is required'),
    body('ending_date').isDate().withMessage('Valid ending date is required')
        .custom((value, { req }) => {
            if (new Date(value) < new Date(req.body.beginning_date)) {
                throw new Error('Ending date must be on or after beginning date');
            }
            return true;
        }),
    body('total_amount').optional().isDecimal().withMessage('Total amount must be a valid number'),
    body('foh_labour').optional().isDecimal().withMessage('FOH labour must be a valid number'),
    body('boh_labour').optional().isDecimal().withMessage('BOH labour must be a valid number'),
    body('other_labour').optional().isDecimal().withMessage('Other labour must be a valid number'),
    body('food_sale').optional().isDecimal().withMessage('Food sale must be a valid number'),
    body('beer_sale').optional().isDecimal().withMessage('Beer sale must be a valid number'),
    body('liquor_sale').optional().isDecimal().withMessage('Liquor sale must be a valid number'),
    body('wine_sale').optional().isDecimal().withMessage('Wine sale must be a valid number'),
    body('beverage_sale').optional().isDecimal().withMessage('Beverage sale must be a valid number'),
    body('bevarage_sale').optional().isDecimal().withMessage('Beverage sale must be a valid number'),  // Handle typo
    body('other_sale').optional().isDecimal().withMessage('Other sale must be a valid number'),
    body('total_guest').optional().isInt({ min: 0 }).withMessage('Total guest must be a positive integer'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    handleValidationErrors
];

// Expense validation rules
const validateExpense = [
    body('restaurant_id').isUUID().withMessage('Valid restaurant ID is required'),
    body('expense_date').isDate().withMessage('Valid expense_date is required'),
    handleValidationErrors
];

// Blue Book validation rules
const validateBlueBook = [
    body('restaurant_id').isUUID().withMessage('Valid restaurant ID is required'),
    body('date').isDate().withMessage('Valid date is required'),
    handleValidationErrors
];

// UUID validation
const validateUUID = (paramName) => [
    param(paramName).isUUID().withMessage(`Valid ${paramName} is required`),
    handleValidationErrors
];

// Optional UUID validation - validates format only if parameter is provided and not empty
const validateOptionalUUID = (paramName) => [
    param(paramName).optional({ checkFalsy: true }).isUUID().withMessage(`Valid ${paramName} is required when provided`),
    handleValidationErrors
];

// Onboarding validation rules
const validateOnboarding = [
    // User fields
    body('user').exists().withMessage('User information is required'),
    body('user.email').isEmail().withMessage('Valid user email is required'),
    body('user.password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('user.first_name').notEmpty().withMessage('First name is required'),
    body('user.last_name').notEmpty().withMessage('Last name is required'),
    body('user.phone_number').optional().isMobilePhone().withMessage('Valid phone number is required'),

    // Company fields
    body('company').exists().withMessage('Company information is required'),
    body('company.company_name').notEmpty().withMessage('Company name is required'),
    body('company.number_of_restaurants').optional().isInt({ min: 0 }).withMessage('Number of restaurants must be a positive integer'),

    // Restaurants array (optional but if present, validate)
    body('company.restaurants').optional().isArray().withMessage('Restaurants must be an array'),
    body('company.restaurants.*.restaurant_name').optional().notEmpty().withMessage('Restaurant name is required'),

    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateUserSignup,
    validateUserSignin,
    validateCompany,
    validateRestaurant,
    validateRevenue,
    validateExpense,
    validateBlueBook,
    validateUUID,
    validateOptionalUUID,
    validateOnboarding,
};
