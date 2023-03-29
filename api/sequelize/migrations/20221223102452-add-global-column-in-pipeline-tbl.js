'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'pipeline';
const column = 'global';
module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  defaultValue: false,
});
