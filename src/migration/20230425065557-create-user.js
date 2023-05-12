'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      username: {
        type: Sequelize.STRING,
        primaryKey: true
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      full_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      display_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      gender: {
        allowNull: false,
        type: Sequelize.STRING
      },
      desc: {
        type: Sequelize.TEXT('long')
      },
      hp: {
        allowNull: false,
        type: Sequelize.STRING
      },
      tgl_lahir: {
        allowNull: false,
        type: Sequelize.DATE
      },
      role: {
        allowNull: false,
        type: Sequelize.STRING
      },
      ktp: {
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
    await queryInterface.dropTable('Users');
  }
};