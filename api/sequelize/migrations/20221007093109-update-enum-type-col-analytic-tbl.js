'use strict';

const column = 'type';
const table = 'analytic';

module.exports = {
  async up(queryInterface, Sequelize) {
    // need to drop enum...
    await queryInterface.changeColumn(table, column, {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_${table}_${column}";
    `);

    await queryInterface.changeColumn(table, column, {
      type: Sequelize.ENUM(
        'AssignedUser',
        'Contact',
        'Course',
        'CourseProgress',
        'CreatedBy',
        'Deal',
        'Lesson',
        'LessonProgress',
        'Organization',
        'Category',
        'DealStage',
        'Tenant',
        'TenantDealStage',
        'User'
      ),
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {},
};
