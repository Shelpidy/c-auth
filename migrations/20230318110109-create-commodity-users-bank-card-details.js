"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("BankCardDetails", {
            bankCardDetailId: {
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
            cardNumber: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            cardType: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            cvvCode: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            cashHolderName: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            billingAddress: {
                allowNull: false,
                type: Sequelize.STRING,
            },
            expirationDate: {
                allowNull: false,
                type: Sequelize.DATE,
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
        await queryInterface.dropTable("BankCardDetails");
    },
};
