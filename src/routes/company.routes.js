const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const { verifyToken, isSuperAdmin, isCompanyAdmin } = require('../middleware/auth');
const { validateCompany, validateUUID } = require('../middleware/validation');

// Company routes
router.post('/', validateCompany, companyController.createCompany); // Public for onboarding
router.get('/onboarded', verifyToken, companyController.getOnboardedCompanies);
router.get('/pending-onboarding', verifyToken, isSuperAdmin, companyController.getPendingCompanies);
router.get('/:company_id', verifyToken, validateUUID('company_id'), companyController.getCompanyById);
router.put('/:company_id', verifyToken, isCompanyAdmin, validateUUID('company_id'), companyController.updateCompany);
router.delete('/:company_id', verifyToken, isSuperAdmin, validateUUID('company_id'), companyController.deleteCompany);

module.exports = router;
