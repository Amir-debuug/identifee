'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'componentText';
const column = 'source';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.ENUM(
    'rpmg',
    'spGlobal',
    'fasterPayments',
    'custom'
  ),
  allowNull: true,
});
