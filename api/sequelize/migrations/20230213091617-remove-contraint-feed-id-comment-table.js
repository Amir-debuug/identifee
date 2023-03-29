'use strict';

const table = 'comments';
const column = 'feed_id';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE ${table} ALTER COLUMN ${column} DROP NOT NULL;
    `);
  },
};
