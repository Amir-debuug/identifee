'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'field';
const column = 'field_type';

module.exports = Migration.alterEnum(table, column, {
  type: Sequelize.ENUM(
    'CHAR',
    'TEXT',
    'NUMBER',
    'DATE',
    'TIME',
    'CURRENCY',
    'URL',
    'CHECKBOX',
    'EMAIL',
    'PHONE'
  ),
  allowNull: false,
});
