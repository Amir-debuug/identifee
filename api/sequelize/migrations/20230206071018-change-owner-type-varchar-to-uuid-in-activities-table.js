'use strict';

const table = 'activities';
const column = 'owner';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE ${table} ALTER COLUMN ${column} SET DATA TYPE UUID USING ${column}::uuid;
    `);
  },
};
