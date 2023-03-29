'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'products';
const column = 'updated_at';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.DATE,
});
