"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Notifications", {
            notificationId: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId",
                },
            },
            title: {
                type: Sequelize.STRING,
            },
            message: {
                type: Sequelize.STRING,
            },
            readStatus: {
                type: Sequelize.ENUM("read", "unread"),
                defaultValue: "unread",
            },
            notificationFromId: {
                type: Sequelize.UUID,
            },
            notificationForId: {
                type: Sequelize.UUID,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            notificationType: {
                type: Sequelize.ENUM("purchase", "transaction", "other"),
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Notifications");
    },
};
