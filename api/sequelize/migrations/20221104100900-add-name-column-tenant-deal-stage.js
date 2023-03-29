'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'tenant_deal_stage';
const column = 'name';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING,
  allowNull: true,
});
