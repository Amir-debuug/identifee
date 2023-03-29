'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS deal_stage
    `);
  },

  async down(queryInterface, Sequelize) {},
};
