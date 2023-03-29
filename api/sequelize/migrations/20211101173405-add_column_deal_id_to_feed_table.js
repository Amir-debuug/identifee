'use strict';

const Sequelize = require('sequelize');
const Migration = require('../Migration');

const table = 'feed';
const column = 'deal_id';

module.exports = Migration.alterColumn('add', table, column, {
  type: Sequelize.DataTypes.UUID,
});
