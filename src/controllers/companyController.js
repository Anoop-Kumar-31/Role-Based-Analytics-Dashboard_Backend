const { Company, Restaurant, User } = require('../models');

// Create company
exports.createCompany = async (req, res) => {
    try {
        const { company_name, company_email, company_phone, number_of_restaurants } = req.body;

        const company = await Company.create({
            company_name,
            company_email,
            company_phone,
            number_of_restaurants: number_of_restaurants || 0,
            is_active: true,
            is_onboarded: false, // Pending approval
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
        const companies = await Company.findAll({
            where: { is_onboarded: true, is_active: true },
            include: [
                { model: Restaurant, as: 'restaurants' },
                { model: User, as: 'users', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']],
        });

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
        const companies = await Company.findAll({
            where: { is_onboarded: false, is_active: true },
            include: [{ model: Restaurant, as: 'restaurants' }],
            order: [['createdAt', 'ASC']],
        });

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

        const company = await Company.findOne({ where: { company_id } });

        if (!company) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No company found with this ID'
            });
        }

        await company.update({ is_onboarded: true, is_active: true });

        res.json({
            data: {
                message: 'Company onboarded successfully',
                company
            }
        });

    } catch (error) {
        console.error('Onboard company error:', error);
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

        const company = await Company.findOne({ where: { company_id } });

        if (!company) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No company found with this ID'
            });
        }

        await company.update({ is_onboarded: false, is_active: false });

        res.json({
            message: 'Company request rejected',
            company
        });

    } catch (error) {
        console.error('Reject company error:', error);
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

        const company = await Company.findOne({
            where: { company_id, is_active: true },
            include: [
                { model: Restaurant, as: 'restaurants' },
                { model: User, as: 'users', attributes: { exclude: ['password'] } }
            ],
        });

        if (!company) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No active company found with this ID'
            });
        }

        res.json({ company });

    } catch (error) {
        console.error('Get company error:', error);
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

        const company = await Company.findOne({ where: { company_id, is_active: true } });

        if (!company) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No active company found with this ID'
            });
        }

        await company.update(updates);

        res.json({
            message: 'Company updated successfully',
            company
        });

    } catch (error) {
        console.error('Update company error:', error);
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

        const company = await Company.findOne({ where: { company_id } });

        if (!company) {
            return res.status(404).json({
                error: 'Company not found',
                message: 'No company found with this ID'
            });
        }

        await company.update({ is_active: false });

        res.json({
            message: 'Company deleted successfully'
        });

    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Error deleting company'
        });
    }
};
