const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboarding.controller');
const { verifyToken, isSuperAdmin } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

// Onboarding routes
router.post('/', onboardingController.createOnboarding); // Public
router.get('/pending', verifyToken, isSuperAdmin, onboardingController.getPendingOnboardings);
router.patch('/onboard/:company_id', verifyToken, isSuperAdmin, validateUUID('company_id'), onboardingController.onboardCompany);
router.patch('/reject/:company_id', verifyToken, isSuperAdmin, validateUUID('company_id'), onboardingController.rejectCompany);

module.exports = router;
