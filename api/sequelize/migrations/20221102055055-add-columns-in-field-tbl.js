'use strict';

const Migration = require('../Migration');

const table = 'field';

module.exports = {
  async up(queryInterface, Sequelize) {
    await Migration.alterColumn('add', table, 'mandatory', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'usedField', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'isFixed', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'columnName', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'isCustom', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'preferred', {
      type: Sequelize.DataTypes.BOOLEAN,
      defaultValue: false,
    }).up(queryInterface, Sequelize);
  },

  async down(queryInterface, Sequelize) {},
};
