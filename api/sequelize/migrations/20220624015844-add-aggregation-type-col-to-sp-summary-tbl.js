'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'sp_summary';
const column = 'aggregation_type';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.ENUM('AVERAGE'),
  allowNull: true,
  after: 'id',
});
