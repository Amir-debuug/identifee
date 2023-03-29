'use strict';

const Migration = require('../Migration');

const table = 'activities';

module.exports = {
  async up(queryInterface, Sequelize) {
    await Migration.alterColumn('add', table, 'priority', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'repeat', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'reminder', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'online_meet', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
  },
};
