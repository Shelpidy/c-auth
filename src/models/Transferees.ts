import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class Transferee extends Model {}

Transferee.init(
    {
        tranfereeId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        transferFromId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
        },
        transferToId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
        },
        transfereeName: {
            type: DataTypes.STRING,
        },
        transferToAccountNumber: {
            type: DataTypes.STRING,
        },
        transferFromAccountNumber: {
            type: DataTypes.STRING,
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
