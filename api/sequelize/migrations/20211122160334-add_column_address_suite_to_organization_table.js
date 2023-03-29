'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'organizations';
const column = 'address_suite';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING(150),
  allowNull: true,
});
