'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_componentText_type" ADD VALUE IF NOT EXISTS 'bar';
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
