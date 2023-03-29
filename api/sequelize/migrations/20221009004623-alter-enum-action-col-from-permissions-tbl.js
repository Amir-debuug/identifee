'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'permissions';
const column = 'action';

module.exports = Migration.alterEnum(table, column, {
  type: Sequelize.ENUM('view', 'manage', 'create', 'edit', 'delete'),
  allowNull: false,
});
