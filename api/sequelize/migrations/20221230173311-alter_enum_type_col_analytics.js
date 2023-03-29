'use strict';

const { Sequelize } = require('sequelize');
const Migration = require('../Migration');

const table = 'analytic';
const column = 'type';

module.exports = Migration.alterEnum(table, column, {
  type: Sequelize.ENUM(
    'AssignedUser',
    'CreatedBy',
    'Contact',
    'Course',
    'CourseProgress',
    'Deal',
    'Lesson',
    'LessonProgress',
    'Organization',
    'Category',
    'DealStage',
    'Tenant',
    'TenantDealStage',
    'User',
    'Training',
    'Activities',
    'Notes',
    'Product'
  ),
  allowNull: false,
});
