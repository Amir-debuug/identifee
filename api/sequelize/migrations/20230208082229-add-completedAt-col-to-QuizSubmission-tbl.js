'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'QuizSubmission';
const column = 'completedAt';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.DATE,
  allowNull: true,
});
