const { Company, Restaurant, User, Revenue, Expense, BlueBook, UserRestaurant } = require('../models');
const { v4: uuidv4 } = require('uuid');

const seedDemoData = async () => {
    try {
        // Check if demo data already exists (to avoid duplicate seeding on server restart)
        const existingDemoAdmin = await User.findOne({ where: { email: 'demo_admin@dashboard.com' } });
        if (existingDemoAdmin) {
            console.log('ℹ️ Demo data already exists. Skipping seeding.');
            return;
        }

        console.log('🚀 Starting Demo Data Seeding...');

        // 1. Create Demo Company
        const [company] = await Company.findOrCreate({
            where: { company_name: 'Demo Hospitality Group' },
            defaults: {
                company_email: 'contact@demogroup.com',
                company_phone: '555-0199',
                number_of_restaurants: 1,
                is_active: true,
                is_onboarded: true
            }
        });

        // 2. Create Demo Restaurants
        const restaurantsData = [
            {
                restaurant_name: 'The Demo Bistro',
                restaurant_email: 'bistro@demogroup.com',
                restaurant_phone: '555-0200',
                restaurant_location: '123 Demo St, New York',
                restaurant_state: 'NY',
                restaurant_zipcode: '10001',
                revenue_targets: { daily: 5000, weekly: 35000 },
                labor_target: { percentage: 15 },
                cogs_target: { percentage: 28 }
            },
            {
                restaurant_name: 'The Demo Grill',
                restaurant_email: 'grill@demogroup.com',
                restaurant_phone: '555-0300',
                restaurant_location: '456 Sample Ave, Chicago',
                restaurant_state: 'IL',
                restaurant_zipcode: '60601',
                revenue_targets: { daily: 8000, weekly: 56000 },
                labor_target: { percentage: 18 },
                cogs_target: { percentage: 30 }
            }
        ];

        const createdRestaurants = [];
        for (const r of restaurantsData) {
            const [restaurant] = await Restaurant.findOrCreate({
                where: { restaurant_name: r.restaurant_name },
                defaults: { ...r, company_id: company.company_id, is_active: true }
            });
            createdRestaurants.push(restaurant);
        }

        // 3. Create Demo Users
        const usersData = [
            {
                first_name: 'Demo',
                last_name: 'Manager',
                email: 'demo_admin@dashboard.com',
                password: 'password123',
                role: 'Company_Admin',
                phone_number: '0000000000',
                company_id: company.company_id
            },
            {
                first_name: 'Demo',
                last_name: 'Employee',
                email: 'demo_employee@dashboard.com',
                password: 'password123',
                phone_number: '1111111111',
                role: 'Restaurant_Employee',
                company_id: company.company_id
            }
        ];

        const createdUsers = [];
        for (const u of usersData) {
            const [user] = await User.findOrCreate({
                where: { email: u.email },
                defaults: u
            });
            createdUsers.push(user);

            // Associate users with ALL demo restaurants
            for (const restaurant of createdRestaurants) {
                await UserRestaurant.findOrCreate({
                    where: { user_id: user.user_id, restaurant_id: restaurant.restaurant_id }
                });
            }
        }

        const adminUser = createdUsers.find(u => u.role === 'Company_Admin');

        // 4. Generate 30 Days of Data for EACH Restaurant
        const today = new Date();
        const categories = ['Inventory', 'Supplies', 'Maintenance', 'Utilities'];

        for (const restaurant of createdRestaurants) {
            console.log(`   Generating 30 days of data for: ${restaurant.restaurant_name}`);

            for (let i = 30; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                // A. Revenue
                const targetRev = restaurant.revenue_targets.daily;
                const dailyRevenue = Math.floor(Math.random() * (targetRev * 1.2 - targetRev * 0.8) + targetRev * 0.8);

                await Revenue.findOrCreate({
                    where: { restaurant_id: restaurant.restaurant_id, beginning_date: dateStr },
                    defaults: {
                        created_by: adminUser.user_id,
                        user_id: adminUser.user_id,
                        ending_date: dateStr,
                        total_amount: dailyRevenue,
                        food_sale: dailyRevenue * 0.7,
                        beer_sale: dailyRevenue * 0.1,
                        liquor_sale: dailyRevenue * 0.1,
                        wine_sale: dailyRevenue * 0.05,
                        beverage_sale: dailyRevenue * 0.05,
                        foh_labour: dailyRevenue * 0.1,
                        boh_labour: dailyRevenue * 0.08,
                        total_guest: Math.floor(dailyRevenue / 45),
                        notes: `Demo revenue entry for ${dateStr} at ${restaurant.restaurant_name}`
                    }
                });

                // B. Expenses (2-3 entries per day)
                const numExpenses = Math.floor(Math.random() * 2) + 2;
                for (let j = 0; j < numExpenses; j++) {
                    const amount = Math.floor(Math.random() * 500 + 50);
                    const category = categories[Math.floor(Math.random() * categories.length)];
                    await Expense.create({
                        restaurant_id: restaurant.restaurant_id,
                        user_id: adminUser.user_id,
                        category: category,
                        vendor_name: `Demo Vendor ${j + 1}`,
                        invoice_number: `INV-${restaurant.restaurant_name.split(' ').pop()}-${dateStr}-${j}`,
                        date: dateStr,
                        amount: amount,
                        description: `Demo expense for ${category}`
                    });
                }

                // C. BlueBook
                await BlueBook.findOrCreate({
                    where: { restaurant_id: restaurant.restaurant_id, date: dateStr },
                    defaults: {
                        user_id: adminUser.user_id,
                        weather: ['Sunny', 'Rainy', 'Cloudy'][Math.floor(Math.random() * 3)],
                        breakfast_sales: dailyRevenue * 0.2,
                        lunch_sales: dailyRevenue * 0.3,
                        dinner_sales: dailyRevenue * 0.5,
                        total_sales: dailyRevenue,
                        hourly_labor: dailyRevenue * (restaurant.labor_target.percentage / 100),
                        hourly_labor_percent: restaurant.labor_target.percentage,
                        splh: 45.5,
                        notes_data: { manager_notes: `Everything ran smoothly at ${restaurant.restaurant_name} on ${dateStr}.` }
                    }
                });
            }
        }

        console.log('✅ Multi-Restaurant Demo Data Seeded Successfully!');
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    }
};

if (require.main === module) {
    seedDemoData().then(() => process.exit());
}

module.exports = { seedDemoData };
