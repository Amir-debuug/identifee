'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE analytic DROP CONSTRAINT analytic_name_key;
      `);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {},
};
