const { Revenue, Expense, Restaurant, User, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Get dashboard statistics
 * @param {Array} restaurantIds - List of restaurant IDs to filter by (or empty for all if super admin)
 * @param {Object} dateRange - { start_date, end_date }
 * @returns {Promise<Object>} Aggregated stats
 */
exports.getStats = async (restaurantIds, dateRange = {}) => {
    try {
        const whereRevenue = { is_active: true };
        const whereExpense = { is_active: true };

        // Apply restaurant filter if provided (if null/undefined, get ALL)
        if (restaurantIds && restaurantIds.length > 0) {
            whereRevenue.restaurant_id = { [Op.in]: restaurantIds };
            whereExpense.restaurant_id = { [Op.in]: restaurantIds };
        } else if (restaurantIds && restaurantIds.length === 0) {
            // Explicitly empty list means access to NOTHING (e.g. employee with no assignments)
            return {
                summary: { totalRevenue: 0, totalExpense: 0, netProfit: 0 },
                breakdown: []
            };
        }

        // Apply date range
        if (dateRange.start_date || dateRange.end_date) {
            const start = dateRange.start_date ? new Date(dateRange.start_date) : new Date('2000-01-01');
            const end = dateRange.end_date ? new Date(dateRange.end_date) : new Date();

            // Revenue uses beginning_date
            whereRevenue.beginning_date = { [Op.between]: [start, end] };
            // Expense uses date
            whereExpense.date = { [Op.between]: [start, end] };
        }

        // 1. Get Totals
        const totalRevenue = await Revenue.sum('total_amount', { where: whereRevenue }) || 0;
        const totalExpense = await Expense.sum('amount', { where: whereExpense }) || 0;

        // 2. Get Breakdown per Restaurant
        // We need to group by restaurant. 
        // Sequelize sum with group by returns array of objects.

        // However, we want a combined list of restaurants with their rev/exp.
        // Best approach: Fetch all relevant restaurants, then query sums for each?
        // OR: use separate aggregation queries and merge in JS. Merging is safer for different tables.

        // Get list of restaurants involved
        const restaurantWhere = { is_active: true };
        if (restaurantIds && restaurantIds.length > 0) {
            restaurantWhere.restaurant_id = { [Op.in]: restaurantIds };
        }

        const restaurants = await Restaurant.findAll({
            where: restaurantWhere,
            attributes: ['restaurant_id', 'restaurant_name', 'company_id'],
            raw: true
        });

        const breakdown = [];

        for (const rest of restaurants) {
            const rId = rest.restaurant_id;

            // Clone where clauses and force specific restaurant
            const rRevWhere = { ...whereRevenue, restaurant_id: rId };
            const rExpWhere = { ...whereExpense, restaurant_id: rId };

            const rRevenue = await Revenue.sum('total_amount', { where: rRevWhere }) || 0;
            const rExpense = await Expense.sum('amount', { where: rExpWhere }) || 0;

            breakdown.push({
                restaurant_id: rId,
                restaurant_name: rest.restaurant_name,
                revenue: rRevenue,
                expense: rExpense,
                net_profit: rRevenue - rExpense
            });
        }

        return {
            summary: {
                totalRevenue,
                totalExpense,
                netProfit: totalRevenue - totalExpense
            },
            breakdown,
            charts: await generateChartData(whereRevenue, whereExpense)
        };

    } catch (error) {
        console.error('Get dashboard stats error:', error);
        throw error;
    }
};

/**
 * Helper to generate chart data
 */
async function generateChartData(revenueWhere, expenseWhere) {
    try {
        // Daily Revenue Trend
        const revenueTrend = await Revenue.findAll({
            where: revenueWhere,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('beginning_date')), 'date'],
                [sequelize.fn('SUM', sequelize.col('total_amount')), 'daily_revenue']
            ],
            group: [sequelize.fn('DATE', sequelize.col('beginning_date'))],
            order: [[sequelize.fn('DATE', sequelize.col('beginning_date')), 'ASC']],
            raw: true
        });

        // Daily Expense Trend
        const expenseTrend = await Expense.findAll({
            where: expenseWhere,
            attributes: [
                [sequelize.fn('DATE', sequelize.col('date')), 'date'],
                [sequelize.fn('SUM', sequelize.col('amount')), 'daily_expense']
            ],
            group: [sequelize.fn('DATE', sequelize.col('date'))],
            order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']],
            raw: true
        });

        // Merge stats by date
        const dateMap = new Map();

        // Process Revenue
        revenueTrend.forEach(item => {
            const dateStr = item.date; // Format depends on DB dialect, usually YYYY-MM-DD
            if (!dateMap.has(dateStr)) dateMap.set(dateStr, { revenue: 0, expense: 0 });
            dateMap.get(dateStr).revenue = parseFloat(item.daily_revenue || 0);
        });

        // Process Expense
        expenseTrend.forEach(item => {
            const dateStr = item.date;
            if (!dateMap.has(dateStr)) dateMap.set(dateStr, { revenue: 0, expense: 0 });
            dateMap.get(dateStr).expense = parseFloat(item.daily_expense || 0);
        });

        // Convert Map to sorted array
        const sortedDates = Array.from(dateMap.keys()).sort();

        const seriesData = sortedDates.map(date => ({
            date,
            revenue: dateMap.get(date).revenue,
            expense: dateMap.get(date).expense,
            net_profit: dateMap.get(date).revenue - dateMap.get(date).expense
        }));

        return {
            revenue_expense_trend: seriesData
        };

    } catch (error) {
        console.error("Error generating chart data:", error);
        return {};
    }
}
