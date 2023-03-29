'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'course_progress';
const column = 'courseContentId';

module.exports = Migration.alterColumn(
  'add',
  table,
  column,
  {
    type: Sequelize.DataTypes.UUID,
  },
  {
    foreign: {
      table: 'CourseContent',
      field: 'courseContentId',
    },
  }
);
