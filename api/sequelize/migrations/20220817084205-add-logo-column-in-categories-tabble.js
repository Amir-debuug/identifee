'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'categories';
const column = 'logo';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING,
  allowNull: true,
});
