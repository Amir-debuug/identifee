'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'groups';
const column = 'has_sibling_access';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
});
