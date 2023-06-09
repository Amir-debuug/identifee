'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'labels';
const column = 'type';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.ENUM('organization', 'people'),
  allowNull: true,
});
