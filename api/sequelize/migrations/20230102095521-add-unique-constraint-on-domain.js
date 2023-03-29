'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE tenants ADD CONSTRAINT domain_unique UNIQUE(domain);
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
