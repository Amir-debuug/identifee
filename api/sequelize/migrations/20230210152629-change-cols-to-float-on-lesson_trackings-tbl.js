'use strict';

const table = 'lesson_trackings';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.changeColumn(table, 'progress', {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
      });
      await queryInterface.changeColumn(table, 'points', {
        type: Sequelize.DataTypes.DECIMAL(10, 2),
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {},
};
