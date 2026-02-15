// Get all available roles
exports.getAllRoles = async (req, res) => {
    try {
        // Since roles are defined as ENUM in User model, return them as hardcoded array
        const roles = [
            {
                role_id: 1,
                role_name: 'Super_Admin',
                description: 'System administrator with full access'
            },
            {
                role_id: 2,
                role_name: 'Company_Admin',
                description: 'Company administrator with company-wide access'
            },
            {
                role_id: 3,
                role_name: 'Restaurant_Employee',
                description: 'Restaurant employee with limited access'
            }
        ];

        res.json({
            data: roles
        });

    } catch (error) {
        console.error('Get all roles error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch roles'
        });
    }
};

// Get role by name
exports.getRoleByName = async (req, res) => {
    try {
        const { role_name } = req.params;

        const rolesMap = {
            'Super_Admin': {
                role_id: 1,
                role_name: 'Super_Admin',
                description: 'System administrator with full access'
            },
            'Company_Admin': {
                role_id: 2,
                role_name: 'Company_Admin',
                description: 'Company administrator with company-wide access'
            },
            'Restaurant_Employee': {
                role_id: 3,
                role_name: 'Restaurant_Employee',
                description: 'Restaurant employee with limited access'
            }
        };

        const role = rolesMap[role_name];

        if (!role) {
            return res.status(404).json({
                error: 'Not found',
                message: 'Role not found'
            });
        }

        res.json({
            message: 'Role fetched successfully',
            role
        });

    } catch (error) {
        console.error('Get role by name error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to fetch role'
        });
    }
};
