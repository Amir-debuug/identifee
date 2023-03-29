'use strict';

const table = 'dashboard';
const column = 'type';
const types = ['dashboard', 'insight'];

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_dashboard_type";
      `);
    } catch (error) {}
    try {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.ENUM(...types),
        allowNull: true,
      });
    } catch (error) {}

    await queryInterface.sequelize.query(`
      update ${table}
      set "${column}" = 'dashboard'
      where "${column}" is null
    `);

    // need to drop enum...
    await queryInterface.changeColumn(table, column, {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });

    try {
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_dashboard_type";
      `);
    } catch (error) {}

    await queryInterface.changeColumn(table, column, {
      type: Sequelize.ENUM(...types),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {},
};
