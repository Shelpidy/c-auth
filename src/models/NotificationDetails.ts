import { Model, DataTypes } from "sequelize";
import sequelize from "../database/connection";

export class NotificationDetail extends Model {}

NotificationDetail.init(
    {
        notificationDetailId: {
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
                key: "userId",
            },
        },
        notificationToken: {
            type: DataTypes.STRING,
        },
        deviceName: {
            type: DataTypes.STRING,
        },
        deviceId: {
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
