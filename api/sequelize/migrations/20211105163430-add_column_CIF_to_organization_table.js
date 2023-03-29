'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'organizations';
const column = 'cif';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.STRING(50),
});
