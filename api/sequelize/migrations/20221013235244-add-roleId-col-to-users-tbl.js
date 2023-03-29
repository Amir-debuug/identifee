'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'users';
const column = 'roleId';

module.exports = Migration.alterColumn(
  'add',
  table,
  column,
  {
    type: Sequelize.DataTypes.UUID,
    allowNull: true,
  },
  {
    foreign: {
      table: 'roles',
      field: 'id',
    },
  }
);
