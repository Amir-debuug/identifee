'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'lesson_pages';
const column = 'contactAccessible';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: false,
});
