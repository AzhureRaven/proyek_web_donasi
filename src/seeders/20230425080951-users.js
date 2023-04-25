'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('users', [
      {
        "username": "AzhureRaven",
        "email": "azhureraven@gmail.com",
        "password": "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
        "full_name": "Azhure Raven",
        "display_name": "Azhure Raven",
        "gender": "Male",
        "desc": "Azhure Raven's Profile",
        "hp": "85231070657",
        "tgl_lahir": "2022-02-17",
        "role": "receiver"
      },
      {
        "username": "ArthurFendy",
        "email": "abrahamarthurfendy@gmail.com",
        "password": "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
        "full_name": "Abraham Arthur Fendy",
        "display_name": "Arthur Fendy",
        "gender": "Male",
        "desc": "Arthur Fendy's Profile",
        "hp": "85231070657",
        "tgl_lahir": "2022-02-17",
        "role": "donator"
      },
      {
        "username": "Erland",
        "email": "erland@gmail.com",
        "password": "5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5",
        "full_name": "Erland Evan",
        "display_name": "Erland",
        "gender": "Male",
        "desc": "Erland's Profile",
        "hp": "85231070657",
        "tgl_lahir": "2022-05-20",
        "role": "donator"
      },
    ], {})
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('users', null, {});
  }
};
