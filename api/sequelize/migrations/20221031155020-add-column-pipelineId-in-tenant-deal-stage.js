'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'tenant_deal_stage';
const column = 'pipelineId';

module.exports = Migration.alterColumn(
  'add',
  table,
  column,
  {
    type: Sequelize.DataTypes.UUID,
    allowNull: true,
  },
  {
    foreign: {
      table: 'pipeline',
      field: 'id',
    },
  }
);
