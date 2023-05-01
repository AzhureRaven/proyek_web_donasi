'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id_transaksi: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      receiver: {
        allowNull: false,
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'username'
        },
      },
      donator: {
        type: Sequelize.STRING,
        references: {
          model: 'users',
          key: 'username'
        },
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      amount: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      cut: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      total: {
        allowNull: false,
        type: Sequelize.DOUBLE
      },
      bank_code: {
        type: Sequelize.STRING
      },
      bank_account: {
        type: Sequelize.STRING
      },
      link_transaksi: {
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      deletedAt: {
        type: Sequelize.DATE
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Transactions');
  }
};