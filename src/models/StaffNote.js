module.exports = (sequelize, DataTypes) => {
    const StaffNote = sequelize.define(
        "StaffNote",
        {
            staff_notes_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            blue_book_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            staff_notes_comment: {
                type: DataTypes.STRING,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        },
        {
            tableName: "staff_notes",
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    StaffNote.associate = (models) => {
        StaffNote.belongsTo(models.BlueBook, {
            foreignKey: "blue_book_id",
            as: "blueBook",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return StaffNote;
};
