"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("Transferees", {
            transfereeId: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            transferFromId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId",
                },
            },
            transferToId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId",
                },
            },
            transfereeName: {
                type: Sequelize.STRING,
            },
            transferToAccountNumber: {
                type: Sequelize.STRING,
            },
            transferFromAccountNumber: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("Transferees");
    },
};
