const { Expense, Restaurant, User, SalesCategory, Invoice, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Create a new expense with complex logic for different types
 * @param {Object} expenseData - Raw expense data from controller
 * @returns {Promise<Object>} Created expense and invoices
 * @throws {Error} If creation fails
 */
exports.createExpense = async (data) => {
    const transaction = await sequelize.transaction();

    try {
        const {
            restaurant_id,
            user_id,
            type, // Maps to category
            salaryAmount,
            oneTimeCategory,
            oneTimeAmount,
            otherDetails,
            otherAmount,
            expense_date,
            amounts, // JSON string or object for Invoices
            vendor_name,
            invoice_number
        } = data;

        // 1. Prepare base expense object
        const expensePayload = {
            restaurant_id,
            user_id,
            category: type,
            created_by: user_id, // Assuming same for now
            date: expense_date || new Date(),
            vendor_name,
            invoice_number
        };

        // 2. Handle specific types -> Amount & Description
        if (type === "Salary") {
            expensePayload.amount = parseFloat(salaryAmount || 0);
        }
        else if (type === "One-Time Expense") {
            expensePayload.amount = parseFloat(oneTimeAmount || 0);
            if (oneTimeCategory) expensePayload.description = oneTimeCategory;
        }
        else if (type === "Other") {
            expensePayload.amount = parseFloat(otherAmount || 0);
            if (otherDetails) expensePayload.description = otherDetails;
        }
        else if (type === "Invoice") {
            expensePayload.amount = 0; // Will calculate if needed, or leave 0 as container
        }
        else {
            // Fallback for generic types
            expensePayload.amount = parseFloat(data.amount || 0);
            expensePayload.description = data.description;
        }

        // 3. Create Expense
        const createdExpense = await Expense.create(expensePayload, { transaction });

        // 4. Handle Invoices
        const createdInvoices = [];
        if (type === "Invoice" && amounts) {
            let parsedAmounts = amounts;
            if (typeof amounts === 'string') {
                try {
                    parsedAmounts = JSON.parse(amounts);
                } catch (e) {
                    throw new Error("Invalid amounts format.");
                }
            }

            if (parsedAmounts && Object.keys(parsedAmounts).length > 0) {
                let totalInvoiceAmount = 0;

                for (const [categoryName, unit_price] of Object.entries(parsedAmounts)) {
                    const price = parseFloat(unit_price || 0);

                    // Find or create sales category
                    let salesCategory = await SalesCategory.findOne({
                        where: { sales_category_name: categoryName, restaurant_id },
                        transaction
                    });

                    if (!salesCategory) {
                        salesCategory = await SalesCategory.create({
                            sales_category_name: categoryName,
                            restaurant_id,
                            is_active: true
                        }, { transaction });
                    }

                    // Create Invoice
                    const invoiceData = {
                        expense_id: createdExpense.expense_id,
                        user_id: user_id,
                        sales_category_id: salesCategory.sales_category_id,
                        date: expense_date || new Date(),
                        quantity: 1,
                        unit_price: price,
                        tax_price: 0,
                        created_by: user_id
                    };

                    const newInvoice = await Invoice.create(invoiceData, { transaction });
                    createdInvoices.push(newInvoice);
                    totalInvoiceAmount += price;
                }

                // Update expense total amount with sum of invoices
                await createdExpense.update({ amount: totalInvoiceAmount }, { transaction });
            }
        }

        await transaction.commit();

        return {
            expense: createdExpense,
            invoices: createdInvoices
        };

    } catch (error) {
        await transaction.rollback();
        console.error('Create expense service error:', error);
        throw error;
    }
};

/**
 * Get all expenses with optional filters and pagination
 * @param {Object} filters - Filter options (restaurant_id, category, start_date, end_date, pagination)
 * @returns {Promise<Object>} Expenses array and pagination info
 * @throws {Error} If query fails
 */
exports.getAllExpenses = async (filters = {}) => {
    try {
        const { restaurant_id, category, start_date, end_date, page = 1, pageSize = 10, company_id } = filters;

        const where = { is_active: true };

        if (restaurant_id) where.restaurant_id = restaurant_id;
        if (company_id) where.company_id = company_id;
        if (category) where.category = category;

        // Filter by date range
        if (start_date && end_date) {
            where.date = { [Op.between]: [start_date, end_date] };
        } else if (start_date) {
            where.date = { [Op.gte]: start_date };
        } else if (end_date) {
            where.date = { [Op.lte]: end_date };
        }

        const offset = (page - 1) * pageSize;

        const { count, rows } = await Expense.findAndCountAll({
            where,
            include: [
                {
                    model: Restaurant,
                    as: 'restaurant',
                    attributes: ['restaurant_id', 'restaurant_name']
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['user_id', 'first_name', 'last_name', 'email']
                },
                {
                    model: Invoice,
                    as: 'invoices',
                    required: false, // Left join, only if exists
                    include: [
                        {
                            model: SalesCategory,
                            as: 'salesCategory',
                            attributes: ['sales_category_id', 'sales_category_name']
                        }
                    ]
                }
            ],
            distinct: true, // Important for correct count with includes
            limit: parseInt(pageSize),
            offset: parseInt(offset),
            order: [['date', 'DESC']],
        });

        return {
            expenses: rows,
            totalCount: count,
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            totalPages: Math.ceil(count / pageSize),
        };
    } catch (error) {
        console.error('Get all expenses service error:', error);
        throw error;
    }
};

/**
 * Update expense
 * @param {string} expense_id - Expense ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated expense
 * @throws {Error} If expense not found
 */
exports.updateExpense = async (expense_id, updates) => {
    try {
        const expense = await Expense.findOne({ where: { expense_id, is_active: true } });

        if (!expense) {
            throw new Error('Expense not found');
        }

        await expense.update(updates);

        return expense;
    } catch (error) {
        console.error('Update expense service error:', error);
        throw error;
    }
};

/**
 * Delete expense (soft delete)
 * @param {string} expense_id - Expense ID
 * @returns {Promise<void>}
 * @throws {Error} If expense not found
 */
exports.deleteExpense = async (expense_id) => {
    try {
        const expense = await Expense.findOne({ where: { expense_id } });

        if (!expense) {
            throw new Error('Expense not found');
        }

        await expense.update({ is_active: false });
    } catch (error) {
        console.error('Delete expense service error:', error);
        throw error;
    }
};
