'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'lesson_pages';
const column = 'quizId';

module.exports = Migration.alterColumn(
  'add',
  table,
  column,
  {
    type: Sequelize.DataTypes.UUID,
  },
  {
    foreign: {
      table: 'Quiz',
      field: 'quizId',
    },
  }
);
