const companyService = require('../services/company.service');

// Create company
exports.createCompany = async (req, res) => {
    try {
        const { company_name, company_email, company_phone, number_of_restaurants } = req.body;

        // Call service layer
        const company = await companyService.createCompany({
            company_name,
            company_email,
            company_phone,
            number_of_restaurants
        });

        res.status(201).json({
            message: 'Company created successfully. Pending approval.',
            company
        });

    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error creating company'
        });
    }
};

// Get all onboarded companies
exports.getOnboardedCompanies = async (req, res) => {
    try {
        // Call service layer
        const companies = await companyService.getOnboardedCompanies();

        res.json({ data: companies });

    } catch (error) {
        console.error('Get onboarded companies error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching companies'
        });
    }
};

// Get pending companies
exports.getPendingCompanies = async (req, res) => {
    try {
        // Call service layer
        const companies = await companyService.getPendingCompanies();

        res.json({ data: companies });

    } catch (error) {
        console.error('Get pending companies error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching pending companies'
        });
    }
};

// Onboard company (approve)
exports.onboardCompany = async (req, res) => {
    try {
        const { company_id } = req.params;

        // Call service layer
        const company = await companyService.onboardCompany(company_id);

        res.json({
            data: {
                message: 'Company onboarded successfully',
                company
            }
        });

    } catch (error) {
        console.error('Onboard company error:', error);

        if (error.message === 'Company not found') {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No company found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error onboarding company'
        });
    }
};

// Reject company
exports.rejectCompany = async (req, res) => {
    try {
        const { company_id } = req.params;

        // Call service layer
        const company = await companyService.rejectCompany(company_id);

        res.json({
            message: 'Company request rejected',
            company
        });

    } catch (error) {
        console.error('Reject company error:', error);

        if (error.message === 'Company not found') {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No company found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error rejecting company'
        });
    }
};

// Get company by ID
exports.getCompanyById = async (req, res) => {
    try {
        const { company_id } = req.params;

        // Call service layer
        const company = await companyService.getCompanyById(company_id);

        res.json({ company });

    } catch (error) {
        console.error('Get company error:', error);

        if (error.message === 'Company not found') {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No active company found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error fetching company'
        });
    }
};

// Update company
exports.updateCompany = async (req, res) => {
    try {
        const { company_id } = req.params;
        const updates = req.body;

        // Call service layer
        const company = await companyService.updateCompany(company_id, updates);

        res.json({
            message: 'Company updated successfully',
            company
        });

    } catch (error) {
        console.error('Update company error:', error);

        if (error.message === 'Company not found') {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No active company found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error updating company'
        });
    }
};

// Delete company (soft delete)
exports.deleteCompany = async (req, res) => {
    try {
        const { company_id } = req.params;

        // Call service layer
        await companyService.deleteCompany(company_id);

        res.json({
            message: 'Company deleted successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);

        if (error.message === 'Company not found') {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No company found with this ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting company'
        });
    }
};
