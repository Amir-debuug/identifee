'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'organizations';
const column = 'external_id';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING(64),
  allowNull: true,
});
