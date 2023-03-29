'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'lessons';
const column = 'isPublic';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
});
