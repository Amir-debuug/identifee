'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'deals';
const column = 'last_status_update';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.DATE,
  allowNull: true,
});
