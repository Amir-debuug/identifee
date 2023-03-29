'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'component';
const column = 'enabled';
module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  defaultValue: true,
});
