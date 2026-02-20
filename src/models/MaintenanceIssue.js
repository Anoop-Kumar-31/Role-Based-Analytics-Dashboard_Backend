module.exports = (sequelize, DataTypes) => {
    const MaintenanceIssue = sequelize.define(
        "MaintenanceIssue",
        {
            maintenance_issue_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            blue_book_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            maintenance_issue_comment: {
                type: DataTypes.STRING,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        },
        {
            tableName: "maintenance_issue",
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    MaintenanceIssue.associate = (models) => {
        MaintenanceIssue.belongsTo(models.BlueBook, {
            foreignKey: "blue_book_id",
            as: "blueBook",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return MaintenanceIssue;
};
