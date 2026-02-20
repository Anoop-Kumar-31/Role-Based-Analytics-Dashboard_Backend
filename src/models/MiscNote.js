module.exports = (sequelize, DataTypes) => {
    const MiscNote = sequelize.define(
        "MiscNote",
        {
            misc_notes_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            blue_book_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            misc_notes_comment: {
                type: DataTypes.STRING,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        },
        {
            tableName: "misc_notes",
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    MiscNote.associate = (models) => {
        MiscNote.belongsTo(models.BlueBook, {
            foreignKey: "blue_book_id",
            as: "blueBook",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return MiscNote;
};
