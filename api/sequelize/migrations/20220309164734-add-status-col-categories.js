'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'categories';
const column = 'status';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING(64),
  allowNull: false,
  defaultValue: 'draft',
});
