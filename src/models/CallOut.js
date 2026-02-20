module.exports = (sequelize, DataTypes) => {
    const CallOut = sequelize.define(
        "CallOut",
        {
            call_out_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            blue_book_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            call_out_comment: {
                type: DataTypes.STRING,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        },
        {
            tableName: "call_out",
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    CallOut.associate = (models) => {
        CallOut.belongsTo(models.BlueBook, {
            foreignKey: "blue_book_id",
            as: "blueBook",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return CallOut;
};
