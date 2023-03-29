'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'field';
const column = 'type';

module.exports = Migration.alterEnum(table, column, {
  type: Sequelize.ENUM(
    'organization',
    'contact',
    'deal',
    'product',
    'task',
    'call',
    'event'
  ),
  allowNull: false,
});
