'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'products';
const column = 'deleted';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  allowNull: true,
  defaultValue: false,
});
