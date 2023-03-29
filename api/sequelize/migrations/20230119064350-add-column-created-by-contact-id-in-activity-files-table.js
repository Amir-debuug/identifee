'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'activity_file';
const column = 'createdByContactId';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.UUID,
  allowNull: true,
});
