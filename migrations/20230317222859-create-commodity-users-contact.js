'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Contacts', {
      contactId: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      country: {
        type: Sequelize.STRING,
      },
      city: {
        type: Sequelize.STRING,
      },
      permanentAddress: {
        type: Sequelize.STRING,
      },
      currentAddress: {
        type: Sequelize.STRING,
      },
      phoneNumbers: {
        type: Sequelize.JSON,
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
    await queryInterface.dropTable('Contacts');
  }
};
