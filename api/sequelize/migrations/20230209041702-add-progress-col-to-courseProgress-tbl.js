'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'course_progress';
const column = 'progress';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.DECIMAL(10, 2),
});
