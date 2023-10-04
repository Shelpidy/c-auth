import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class EncryptionKey extends Model {}

EncryptionKey.init(
    {
        encryptionKeyId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        publicKey: {
            type: DataTypes.TEXT,
        },
        privateKey: {
            type: DataTypes.TEXT,
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
