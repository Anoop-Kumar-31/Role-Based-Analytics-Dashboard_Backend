const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Pos = sequelize.define('Pos', {
        pos_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        restaurant_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        uses_toast_pos: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        platform: {
            type: DataTypes.STRING(100),
            comment: 'POS platform name (e.g., Toast, Square, Clover)',
        },
        ssh_data_exports_enabled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        need_help_enabling_exports: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        credential: {
            type: DataTypes.JSONB,
            defaultValue: {},
            comment: 'POS API credentials and configuration',
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'pos',
        timestamps: true,
        indexes: [
            { fields: ['restaurant_id'] },
            { fields: ['platform'] },
        ],
    });

    return Pos;
};
