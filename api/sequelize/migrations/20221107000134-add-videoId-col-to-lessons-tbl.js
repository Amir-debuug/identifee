'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'lessons';
const column = '"videoId"';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING,
  allowNull: true,
});
