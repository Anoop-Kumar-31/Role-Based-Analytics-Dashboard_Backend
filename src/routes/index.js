const express = require('express');
const router = express.Router();

// Import controllers
const userController = require('../controllers/userController');
const companyController = require('../controllers/companyController');
const restaurantController = require('../controllers/restaurantController');
const revenueController = require('../controllers/revenueController');
const expenseController = require('../controllers/expenseController');
const blueBookController = require('../controllers/blueBookController');
const onboardingController = require('../controllers/onboardingController');
const locationController = require('../controllers/locationController');

// Import middleware
const { verifyToken, isSuperAdmin, isCompanyAdmin, belongsToCompany } = require('../middleware/auth');
const {
    validateUserSignup,
    validateUserSignin,
    validateCompany,
    validateRestaurant,
    validateRevenue,
    validateExpense,
    validateBlueBook,
    validateUUID,
    validateOptionalUUID
} = require('../middleware/validation');

// ====================
// ONBOARDING ROUTES (Public)
// ====================
router.post('/onboarding', onboardingController.createOnboarding);
router.get('/onboarding/pending', verifyToken, isSuperAdmin, onboardingController.getPendingOnboardings);

// ====================
// AUTH ROUTES (Public)
// ====================
router.post('/users/signin', validateUserSignin, userController.signin);

// ====================
// USER ROUTES
// ====================
router.post('/users', verifyToken, isCompanyAdmin, validateUserSignup, userController.addUser);
router.get('/users', verifyToken, userController.getAllUsers);
router.get('/users/:user_id', verifyToken, validateUUID('user_id'), userController.getUserById);
router.put('/users/:user_id', verifyToken, validateUUID('user_id'), userController.updateUser);
router.delete('/users/:user_id', verifyToken, isCompanyAdmin, validateUUID('user_id'), userController.deleteUser);
router.patch('/users/:user_id/block', verifyToken, isCompanyAdmin, validateUUID('user_id'), userController.toggleBlockUser);
router.get('/users/restaurants/:user_id', verifyToken, validateUUID('user_id'), userController.getUserRestaurants);
// router.post('/users/add', verifyToken, validateUserSignup, userController.addUser); // Add new user with restaurant

// ====================
// COMPANY ROUTES
// ====================
router.post('/companies', validateCompany, companyController.createCompany); // Public for onboarding
router.get('/companies/onboarded', verifyToken, companyController.getOnboardedCompanies);
router.get('/companies/pending-onboarding', verifyToken, isSuperAdmin, companyController.getPendingCompanies);
router.get('/companies/:company_id', verifyToken, validateUUID('company_id'), companyController.getCompanyById);
router.put('/companies/:company_id', verifyToken, isCompanyAdmin, validateUUID('company_id'), companyController.updateCompany);
router.delete('/companies/:company_id', verifyToken, isSuperAdmin, validateUUID('company_id'), companyController.deleteCompany);

// Onboarding approval routes
router.patch('/onboarding/onboard/:company_id', verifyToken, isSuperAdmin, validateUUID('company_id'), companyController.onboardCompany);
router.patch('/onboarding/reject/:company_id', verifyToken, isSuperAdmin, validateUUID('company_id'), companyController.rejectCompany);

// ====================
// RESTAURANT ROUTES
// ====================
router.post('/restaurants', verifyToken, isCompanyAdmin, validateRestaurant, restaurantController.createRestaurant);
router.get('/restaurants/by-company/:company_id?', verifyToken, validateOptionalUUID('company_id'), restaurantController.getRestaurantsByCompany);
router.get('/restaurants/:restaurant_id', verifyToken, validateUUID('restaurant_id'), restaurantController.getRestaurantById);
router.put('/restaurants/:restaurant_id', verifyToken, isCompanyAdmin, validateUUID('restaurant_id'), restaurantController.updateRestaurant);
router.delete('/restaurants/:restaurant_id', verifyToken, isCompanyAdmin, validateUUID('restaurant_id'), restaurantController.deleteRestaurant);


// ====================
// REVENUE ROUTES
// ====================
router.post('/restaurants/:restaurant_id/revenue', verifyToken, validateUUID('restaurant_id'), validateRevenue, revenueController.createRevenue);
router.get('/restaurants/revenue/all', verifyToken, revenueController.getAllRevenues);
router.put('/restaurants/revenue/:revenue_id', verifyToken, validateUUID('revenue_id'), revenueController.updateRevenue);
router.delete('/restaurants/revenue/:revenue_id', verifyToken, validateUUID('revenue_id'), revenueController.deleteRevenue);

// ====================
// EXPENSE ROUTES
// ====================
router.post('/expense', verifyToken, validateExpense, expenseController.createExpense);
router.get('/expense', verifyToken, expenseController.getAllExpenses);
router.put('/expense/:expense_id', verifyToken, validateUUID('expense_id'), expenseController.updateExpense);
router.delete('/expense/:expense_id', verifyToken, validateUUID('expense_id'), expenseController.deleteExpense);

// ====================
// BLUE BOOK ROUTES
// ====================
router.post('/blue-book', verifyToken, validateBlueBook, blueBookController.createBlueBook);
router.get('/blue-book/:restaurant_id/:date', verifyToken, validateUUID('restaurant_id'), blueBookController.getBlueBookByDate);
router.put('/blue-book/:blue_book_id', verifyToken, validateUUID('blue_book_id'), blueBookController.updateBlueBook);
router.delete('/blue-book/:blue_book_id', verifyToken, validateUUID('blue_book_id'), blueBookController.deleteBlueBook);

// ====================
// ROLES ROUTES
// ====================
const rolesController = require('../controllers/rolesController');
router.get('/roles', verifyToken, rolesController.getAllRoles);
router.get('/roles/:role_name', verifyToken, rolesController.getRoleByName);

// ====================
// LOCATION ROUTES
// ====================
router.put('/location', verifyToken, locationController.updateLocationData);


module.exports = router;
