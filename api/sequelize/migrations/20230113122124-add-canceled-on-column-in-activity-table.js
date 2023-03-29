'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'activities';
const column = 'canceledOn';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.DATE,
  allowNull: true,
});
