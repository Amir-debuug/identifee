'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'lesson_pages';
const column = 'videoId';

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
      table: 'video',
      field: 'videoId',
    },
  }
);
