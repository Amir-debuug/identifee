'use strict';

const table = 'video';
const column = 'muxUploadUrl';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE ${table} ALTER COLUMN "${column}" TYPE text;
    `);
  },
};
