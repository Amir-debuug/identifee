'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'permissions';
const column = 'collection';

module.exports = Migration.alterEnum(table, column, {
  type: Sequelize.ENUM(
    // added to differentiate between admin and owner privileged users
    'admin',
    'owner',

    // actual resources
    'accounts',
    'activities',
    'analytics',
    'categories',
    'contacts',
    'courses',
    'dashboards',
    'deals',
    'lessons',
    'notes',
    'products',
    'prospects',
    'quizzes',
    'reports',

    'dashboard', // deprecated, replaced wth dashboards
    'insights' // deprecated, replace with analytics (?)
  ),
  allowNull: false,
});
