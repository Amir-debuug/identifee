'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'tenants';
const column = 'use_logo';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  defaultValue: false,
});
