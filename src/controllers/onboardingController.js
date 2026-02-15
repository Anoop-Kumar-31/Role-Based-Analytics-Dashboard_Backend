const bcrypt = require('bcrypt');
const db = require('../models');
const forecastService = require('../services/forecastService');
const targetService = require('../services/targetService');
const salesCategoryService = require('../services/salesCategoryService');
const posService = require('../services/posService');

// Helper function to convert month names to numbers
function convertMonthNameToNumber(month) {
    const months = {
        january: 1, february: 2, march: 3, april: 4,
        may: 5, june: 6, july: 7, august: 8,
        september: 9, october: 10, november: 11, december: 12
    };
    return months[month.toLowerCase()];
}

// Complete onboarding with transaction
exports.createOnboarding = async (req, res) => {
    const { sequelize, User, Company, Restaurant, Pos } = db;

    try {
        const payload = req.body;

        console.log('📌 Onboarding Payload:', JSON.stringify(payload, null, 2));

        // Validate payload
        if (!payload.user || !payload.company) {
            return res.status(400).json({
                error: 'Invalid payload',
                message: 'User and company information are required'
            });
        }

        // Start transaction
        const result = await sequelize.transaction(async (transaction) => {
            const userInfo = payload.user;
            const companySection = payload.company;
            const toastSection = payload.toast || {};
            const { restaurants: restaurantSection = [], ...companyInfo } = companySection;

            // =============================
            // 1. CREATE COMPANY
            // =============================
            console.log('📌 Step 1: Creating company...');

            companyInfo.company_email = companyInfo.company_email || userInfo.email;
            companyInfo.company_phone = userInfo.phone_number;
            companyInfo.company_location = userInfo.location;
            companyInfo.is_onboarded = false; // Pending approval
            companyInfo.is_active = true;

            const company = await Company.create(companyInfo, { transaction });
            const company_id = company.company_id;

            console.log(`✅ Company created: ${company.company_name} (${company_id})`);

            // =============================
            // 2. CREATE RESTAURANTS & RELATED DATA
            // =============================
            const createdRestaurants = [];

            for (const restaurantData of restaurantSection) {
                console.log(`\n📌 Step 2: Creating restaurant: ${restaurantData.restaurant_name}`);

                // Set restaurant defaults
                restaurantData.company_id = company_id;
                restaurantData.restaurant_email = restaurantData.restaurant_email || userInfo.email;
                restaurantData.restaurant_phone = restaurantData.restaurant_phone || userInfo.phone_number;

                // Extract nested targets before creating restaurant
                const revenueTargets = restaurantData.revenue_targets || {};
                const laborTarget = restaurantData.labor_target || {};
                const cogsTarget = restaurantData.cogs_target || {};

                // Remove nested objects from restaurant data
                delete restaurantData.revenue_targets;
                delete restaurantData.labor_target;
                delete restaurantData.cogs_target;

                // Create restaurant
                const restaurant = await Restaurant.create(restaurantData, { transaction });
                createdRestaurants.push(restaurant);

                console.log(`✅ Restaurant created: ${restaurant.restaurant_name} (${restaurant.restaurant_id})`);

                // 2.1: Create POS entry for this restaurant
                if (toastSection.platform || toastSection.uses_toast_pos) {
                    console.log(`📌 Step 2.1: Creating POS entry...`);

                    await Pos.create({
                        restaurant_id: restaurant.restaurant_id,
                        uses_toast_pos: toastSection.uses_toast_pos || false,
                        platform: toastSection.platform,
                        ssh_data_exports_enabled: toastSection.ssh_data_exports_enabled || false,
                        need_help_enabling_exports: toastSection.need_help_enabling_exports || false,
                        credential: {},
                    }, { transaction });

                    console.log(`✅ POS created for ${restaurant.restaurant_name}`);
                }

                // 2.2: Create default sales categories
                console.log(`📌 Step 2.2: Creating default sales categories...`);

                const defaultCategories = ['Beer', 'Others', 'Tax', 'Liquor', 'Wine',
                    'NA Beverage', 'Food', 'Pastry', 'Retail',
                    'Smallware', 'Linen'];

                for (const categoryName of defaultCategories) {
                    await salesCategoryService.createSalesCategory({
                        sales_category_name: categoryName,
                        restaurant_id: restaurant.restaurant_id,
                    }, { transaction });
                }

                console.log(`✅ Created ${defaultCategories.length} sales categories`);

                // 2.3: Create revenue forecasts (monthly targets)
                console.log(`📌 Step 2.3: Creating revenue forecasts...`);

                const currentYear = new Date().getFullYear();
                let forecastCount = 0;

                for (const [monthName, amount] of Object.entries(revenueTargets)) {
                    const monthNumber = convertMonthNameToNumber(monthName);
                    if (monthNumber && !isNaN(Number(amount))) {
                        await forecastService.createForecast({
                            restaurant_id: restaurant.restaurant_id,
                            forecast_year: currentYear,
                            forecast_month: monthNumber,
                            forecast_amount: Number(amount),
                        }, { transaction });
                        forecastCount++;
                    }
                }

                console.log(`✅ Created ${forecastCount} revenue forecasts`);

                // 2.4: Create targets (labor + COGS)
                console.log(`📌 Step 2.4: Creating labor and COGS targets...`);

                const currentMonth = new Date().getMonth() + 1;

                await targetService.createTarget({
                    restaurant_id: restaurant.restaurant_id,
                    year: currentYear,
                    month: currentMonth,
                    // Labor targets
                    overall_labor_target: Number(laborTarget.overall_labor_target || 0),
                    foh_target: Number(laborTarget.foh_target || 0),
                    boh_target: Number(laborTarget.boh_target || 0),
                    foh_combined_salaried: Number(laborTarget.foh_combined_salaried || 0),
                    boh_combined_salaried: Number(laborTarget.boh_combined_salaried || 0),
                    includes_salaries: laborTarget.includes_salaries || false,
                    // COGS targets
                    food: Number(cogsTarget.food || 0),
                    pastry: Number(cogsTarget.pastry || 0),
                    beer: Number(cogsTarget.beer || 0),
                    wine: Number(cogsTarget.wine || 0),
                    liquor: Number(cogsTarget.liquor || 0),
                    NA_Bev: Number(cogsTarget.NA_Bev || 0),
                    smallwares: Number(cogsTarget.smallwares || 0),
                    others: Number(cogsTarget.others || 0),
                }, { transaction });

                console.log(`✅ Targets created for ${currentYear}/${currentMonth}`);
            }

            // =============================
            // 3. CREATE USER
            // =============================
            console.log(`\n📌 Step 3: Creating user...`);

            // Check if user already exists
            const existingUser = await User.findOne({
                where: { email: userInfo.email },
                transaction
            });

            if (existingUser) {
                throw new Error('User already exists with this email');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userInfo.password || 'default@123', 10);

            const user = await User.create({
                first_name: userInfo.first_name,
                last_name: userInfo.last_name,
                email: userInfo.email,
                password: hashedPassword,
                phone_number: userInfo.phone_number,
                role: 'Company_Admin', // First user is company admin
                company_id: company_id,
            }, { transaction });

            console.log(`✅ User created: ${user.first_name} ${user.last_name} (${user.email})`);

            // =============================
            // 4. LINK USER TO RESTAURANTS
            // =============================
            console.log(`\n📌 Step 4: Linking user to restaurants...`);

            const restaurantIds = createdRestaurants.map(r => r.restaurant_id);
            await user.addRestaurants(restaurantIds, { transaction });

            console.log(`✅ User linked to ${restaurantIds.length} restaurants`);

            // Return complete result
            return {
                user: {
                    user_id: user.user_id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    company_id: user.company_id,
                },
                company: {
                    company_id: company.company_id,
                    company_name: company.company_name,
                    is_onboarded: company.is_onboarded,
                    number_of_restaurants: createdRestaurants.length,
                },
                restaurants: createdRestaurants.map(r => ({
                    restaurant_id: r.restaurant_id,
                    restaurant_name: r.restaurant_name,
                    location: r.restaurant_location,
                })),
            };
        });

        // Success response
        console.log('\n✅ ONBOARDING COMPLETE!\n');

        res.status(201).json({
            message: 'Onboarding successful! Company pending approval.',
            data: result,
        });

    } catch (error) {
        console.error('❌ Onboarding Error:', error);

        if (error.message.includes('User already exists')) {
            return res.status(409).json({
                error: 'Conflict',
                message: 'A user already exists with this email address'
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to complete onboarding',
            details: error.message,
        });
    }
};

// Get pending onboarding requests
exports.getPendingOnboardings = async (req, res) => {
    try {
        const { Company, Restaurant } = db;

        const pendingCompanies = await Company.findAll({
            where: { is_onboarded: false, is_active: true },
            include: [
                {
                    model: Restaurant,
                    as: 'restaurants',
                    attributes: ['restaurant_id', 'restaurant_name', 'restaurant_location'],
                }
            ],
            order: [['createdAt', 'ASC']],
        });

        res.json({
            message: 'Pending onboarding requests',
            count: pendingCompanies.length,
            companies: pendingCompanies,
        });

    } catch (error) {
        console.error('Get pending onboardings error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch pending onboardings'
        });
    }
};
