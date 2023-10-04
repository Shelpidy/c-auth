"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("EncryptionKeys", {
            encryptionKeyId: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: Sequelize.UUIDV4,
            },
            publicKey: {
                type: Sequelize.TEXT,
            },
            privateKey: {
                type: Sequelize.TEXT,
            },
            userId: {
                type: Sequelize.UUID,
                unique: true,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "userId",
                },
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
        await queryInterface.dropTable("EncryptionKeys");
    },
};
