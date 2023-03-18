'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
            await queryInterface.createTable('CommodityTransactions', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey:true,
                type: Sequelize.INTEGER,
            },
            transferorAccountNumber: {
                type: Sequelize.STRING,
            },
            transfereeAccountNumber: {
                type: Sequelize.STRING,
            },
            amount: {
                type: Sequelize.STRING,
            },
            transactionId: {
                type: Sequelize.STRING,
                unique:true
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


    async down(queryInterface, Sequelize) {

        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
          await queryInterface.dropTable('CommodityTransactions');
    },
};
