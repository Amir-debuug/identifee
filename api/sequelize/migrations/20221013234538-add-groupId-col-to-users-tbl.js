'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'users';
const column = 'groupId';

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
      table: 'groups',
      field: 'id',
    },
  }
);
