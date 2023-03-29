'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'componentText';
const column = 'request';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.JSON,
});
