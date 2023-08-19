import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class ApiToken extends Model {}

ApiToken.init(
    {
        tokenId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: {
            type: DataTypes.UUIDV4,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
        },
        apiToken: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        expirationDate: {
            allowNull: true,
            type: DataTypes.DATE,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        updatedAt: {
            allowNull: true,
            type: DataTypes.DATE,
        },
    },
    { sequelize }
);
