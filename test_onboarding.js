
const payload = {
    "user": {
        "first_name": "Amit",
        "last_name": "Kumar",
        "email": "amt312002@gmail.com",
        "phone_number": "07985345837",
        "preferred_contact_method": "Phone"
    },
    "company": {
        "company_name": "Amit's Company",
        "number_of_restaurants": 2,
        "restaurants": [
            {
                "restaurant_name": "Amit's Restaurant",
                "location": "Uttar Pradesh",
                "revenue_targets": {
                    "january": "50000", "february": "75000", "march": "60000", "april": "65000",
                    "may": "1000000", "june": "40000", "july": "45000", "august": "55000",
                    "september": "60000", "october": "50000", "november": "40000", "december": "50000"
                },
                "labor_target": {
                    "has_labor_target": false, "overall_labor_target": "50", "foh_target": "10",
                    "boh_target": "40", "includes_salaries": false, "foh_combined_salaried": "20000",
                    "boh_combined_salaried": "25000"
                },
                "cogs_target": {
                    "has_cogs_target": false, "food": "10", "pastry": "10", "beer": "25", "wine": "10",
                    "liquor": "20", "NA_Bev": "30", "smallwares": "15", "others": "20"
                }
            },
            {
                "restaurant_name": "Amit's Company 2",
                "location": "Chandigarh",
                "revenue_targets": {
                    "january": "5775", "february": "2727", "march": "2727", "april": "7752",
                    "may": "7272", "june": "27272", "july": "2752", "august": "752",
                    "september": "752", "october": "7552", "november": "2727", "december": "72727"
                },
                "labor_target": {
                    "has_labor_target": false, "overall_labor_target": "10", "foh_target": "5",
                    "boh_target": "14", "includes_salaries": false, "foh_combined_salaried": "52000",
                    "boh_combined_salaried": "45000"
                },
                "cogs_target": {
                    "has_cogs_target": false, "food": "5", "pastry": "5", "beer": "10",
                    "wine": "15", "liquor": "1", "NA_Bev": "5", "smallwares": "10", "others": "15"
                }
            }
        ]
    },
    "toast": {
        "uses_toast_pos": false, "platform": "Nope", "ssh_data_exports_enabled": false,
        "need_help_enabling_exports": false
    }
};

async function testOnboarding() {
    try {
        console.log('Sending onboarding request...');
        const response = await fetch('http://localhost:8080/api/v1/onboarding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status);
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testOnboarding();
