'use strict';

const table = 'course_progress';
const column = 'status';
const types = ['in_progress', 'completed', 'failed'];

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
      drop type enum_course_progress_status;
      `);
    } catch (error) {}

    try {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.DataTypes.ENUM(...types),
        allowNull: false,
        defaultValue: 'in_progress',
      });
    } catch (error) {}

    // need to drop enum...
    await queryInterface.changeColumn(table, column, {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });
    try {
      await queryInterface.sequelize.query(`
      drop type enum_course_progress_status;
      `);
    } catch (error) {}

    await queryInterface.changeColumn(table, column, {
      type: Sequelize.ENUM(...types),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {},
};
