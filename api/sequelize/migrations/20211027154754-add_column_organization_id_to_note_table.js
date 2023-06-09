'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'note';
const column = 'organization_id';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.UUID,
  allowNull: true,
});
