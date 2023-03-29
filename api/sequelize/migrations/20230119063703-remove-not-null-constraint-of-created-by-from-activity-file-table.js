'use strict';

const table = 'activity_file';
const column = 'created_by';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE ${table} ALTER COLUMN ${column} DROP NOT NULL;
    `);
  },
};
