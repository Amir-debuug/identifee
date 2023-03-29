'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'pipeline';
const column = '"isDefault"';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
});
