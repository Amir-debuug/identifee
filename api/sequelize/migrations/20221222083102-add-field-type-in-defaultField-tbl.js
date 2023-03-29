'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_defaultField_field_type" ADD VALUE IF NOT EXISTS 'CHECKBOX';
      `);
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_defaultField_field_type" ADD VALUE IF NOT EXISTS 'EMAIL';
      `);
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_defaultField_field_type" ADD VALUE IF NOT EXISTS 'URL';
      `);
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_defaultField_field_type" ADD VALUE IF NOT EXISTS 'PHONE';
      `);
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_defaultField_field_type" ADD VALUE IF NOT EXISTS 'CURRENCY';
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
