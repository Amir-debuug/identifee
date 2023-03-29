'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'audit';
const column = 'resourceType';

module.exports = Migration.alterEnum(table, column, {
  type: Sequelize.ENUM(
    'activity',
    'activityRequest',
    'contact',
    'contactOwner',
    'comment',
    'deal',
    'dealOwner',
    'note',
    'organization',
    'organizationOwner',
    'user'
  ),
  allowNull: false,
});
