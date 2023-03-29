'use strict';

const Migration = require('../Migration');

const table = 'defaultField';
const column = 'section';

module.exports = {
  async up(queryInterface, Sequelize) {
    await Migration.alterColumn('add', table, column, {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: '',
    }).up(queryInterface, Sequelize);

    await queryInterface.sequelize.query(`
      alter table "${table}" alter column "${column}" drop default;
    `);
  },
};
