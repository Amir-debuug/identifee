'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'activities';
const column = 'rich_note';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.JSON,
  allowNull: true,
});
