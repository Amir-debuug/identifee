'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        DROP INDEX unique_key;
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
