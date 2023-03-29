'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'lesson_trackings';
const column = 'score';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.DECIMAL(10, 2),
});
