const { Company, Restaurant, User } = require('../models');

/**
 * Create a new company (pending approval)
 * @param {Object} companyData - Company data
 * @returns {Promise<Object>} Created company
 * @throws {Error} If creation fails
 */
exports.createCompany = async (companyData) => {
    try {
        const company = await Company.create({
            company_name: companyData.company_name,
            company_email: companyData.company_email,
            company_phone: companyData.company_phone,
            number_of_restaurants: companyData.number_of_restaurants || 0,
            is_active: true,
            is_onboarded: false, // Pending approval
        });

        return company;
    } catch (error) {
        console.error('Create company service error:', error);
        throw error;
    }
};

/**
 * Get all onboarded companies
 * @returns {Promise<Array>} Array of onboarded companies with relationships
 * @throws {Error} If query fails
 */
exports.getOnboardedCompanies = async () => {
    try {
        const companies = await Company.findAll({
            where: { is_onboarded: true, is_active: true },
            include: [
                { model: Restaurant, as: 'restaurants' },
                { model: User, as: 'users', attributes: { exclude: ['password'] } }
            ],
            order: [['createdAt', 'DESC']],
        });

        return companies;
    } catch (error) {
        console.error('Get onboarded companies service error:', error);
        throw error;
    }
};

/**
 * Get pending companies (not yet onboarded)
 * @returns {Promise<Array>} Array of pending companies
 * @throws {Error} If query fails
 */
exports.getPendingCompanies = async () => {
    try {
        const companies = await Company.findAll({
            where: { is_onboarded: false, is_active: true },
            include: [{ model: Restaurant, as: 'restaurants' }],
            order: [['createdAt', 'ASC']],
        });

        return companies;
    } catch (error) {
        console.error('Get pending companies service error:', error);
        throw error;
    }
};

/**
 * Onboard a company (approve)
 * @param {string} company_id - Company ID
 * @returns {Promise<Object>} Onboarded company
 * @throws {Error} If company not found
 */
exports.onboardCompany = async (company_id) => {
    try {
        const company = await Company.findOne({ where: { company_id } });

        if (!company) {
            throw new Error('Company not found');
        }

        await company.update({ is_onboarded: true, is_active: true });

        return company;
    } catch (error) {
        console.error('Onboard company service error:', error);
        throw error;
    }
};

/**
 * Reject a company onboarding request
 * @param {string} company_id - Company ID
 * @returns {Promise<Object>} Rejected company
 * @throws {Error} If company not found
 */
exports.rejectCompany = async (company_id) => {
    try {
        const company = await Company.findOne({ where: { company_id } });

        if (!company) {
            throw new Error('Company not found');
        }

        await company.update({ is_onboarded: false, is_active: false });

        return company;
    } catch (error) {
        console.error('Reject company service error:', error);
        throw error;
    }
};

/**
 * Get company by ID with relationships
 * @param {string} company_id - Company ID
 * @returns {Promise<Object>} Company with restaurants and users
 * @throws {Error} If company not found
 */
exports.getCompanyById = async (company_id) => {
    try {
        const company = await Company.findOne({
            where: { company_id, is_active: true },
            include: [
                { model: Restaurant, as: 'restaurants' },
                { model: User, as: 'users', attributes: { exclude: ['password'] } }
            ],
        });

        if (!company) {
            throw new Error('Company not found');
        }

        return company;
    } catch (error) {
        console.error('Get company by ID service error:', error);
        throw error;
    }
};

/**
 * Update company
 * @param {string} company_id - Company ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated company
 * @throws {Error} If company not found
 */
exports.updateCompany = async (company_id, updates) => {
    try {
        const company = await Company.findOne({ where: { company_id, is_active: true } });

        if (!company) {
            throw new Error('Company not found');
        }

        await company.update(updates);

        return company;
    } catch (error) {
        console.error('Update company service error:', error);
        throw error;
    }
};

/**
 * Delete company (soft delete)
 * @param {string} company_id - Company ID
 * @returns {Promise<void>}
 * @throws {Error} If company not found
 */
exports.deleteCompany = async (company_id) => {
    try {
        const company = await Company.findOne({ where: { company_id } });

        if (!company) {
            throw new Error('Company not found');
        }

        await company.update({ is_active: false });
    } catch (error) {
        console.error('Delete company service error:', error);
        throw error;
    }
};
