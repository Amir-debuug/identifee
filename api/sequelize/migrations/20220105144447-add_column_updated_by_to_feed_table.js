'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'feed';
const column = 'updated_by';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.UUID,
  allowNull: true,
});
