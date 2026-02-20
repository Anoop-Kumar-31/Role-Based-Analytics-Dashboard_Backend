module.exports = (sequelize, DataTypes) => {
    const Wins = sequelize.define(
        "Win",
        {
            wins_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            blue_book_id: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            wins_comment: {
                type: DataTypes.STRING,
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            },
        },
        {
            tableName: "wins",
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        }
    );

    Wins.associate = (models) => {
        Wins.belongsTo(models.BlueBook, {
            foreignKey: "blue_book_id",
            as: "blueBook",
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        });
    };

    return Wins;
};
