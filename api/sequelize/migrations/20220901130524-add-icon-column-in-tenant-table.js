'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'tenants';
const column = 'icon';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.TEXT,
  allowNull: true,
});
