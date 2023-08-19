import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class BankCardDetail extends Model {}

BankCardDetail.init(
    {
        bankCardDetailId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "id",
            },
        },
        cardNumber: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        cardType: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        cvvCode: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        cashHolderName: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        billingAddress: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        expirationDate: {
            allowNull: false,
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
