'use strict';

const table = 'permissions';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // someone must have manually added this...
      try {
        await queryInterface.sequelize.query(`
        DROP INDEX "Permission_pkey";
      `);
      } catch (error) {}

      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} DROP CONSTRAINT permissions_pkey;
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} ADD PRIMARY KEY (role, collection, action);
      `);
      await queryInterface.sequelize.query(`
        ALTER TABLE ${table} DROP COLUMN id;
      `);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {},
};
