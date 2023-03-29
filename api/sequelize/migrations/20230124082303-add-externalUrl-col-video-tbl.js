'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'video';
const column = 'externalUrl';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.TEXT,
});
