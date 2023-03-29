'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'field';
const column = 'order';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
});
