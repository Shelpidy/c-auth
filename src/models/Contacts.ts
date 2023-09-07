import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class Contact extends Model {}

Contact.init(
    {
        contactId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        country: {
            type: DataTypes.STRING,
        },
        city: {
            type: DataTypes.STRING,
        },
        permanentAddress: {
            type: DataTypes.STRING,
        },
        currentAddress: {
            type: DataTypes.STRING,
        },
        phoneNumbers: {
            type: DataTypes.JSON,
        },
        userId: {
            type: DataTypes.UUID,
            unique: true,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
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
