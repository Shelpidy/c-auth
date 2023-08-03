import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class Notification extends Model {}

Notification.init(
    {
        notificationId: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue:DataTypes.UUIDV4
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "Users",
                key: "userId",
            },
        },
        title: {
            type: DataTypes.STRING,
        },
        message: {
            type: DataTypes.STRING,
        },
        readStatus: {
            type: DataTypes.ENUM("read","unread"),
            defaultValue:'unread'
        },
        notificationFromId: {
            type: DataTypes.UUID,
        },
        notificationForId: {
            type: DataTypes.UUID,
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
        },
        notificationType: {
            type: DataTypes.ENUM("purchase",'transaction',"other"),
        },
        updatedAt: {
            allowNull: true,
            type: DataTypes.DATE,
        },
    },
    { sequelize }
);
