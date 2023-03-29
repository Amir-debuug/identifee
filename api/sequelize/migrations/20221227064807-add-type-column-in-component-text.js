'use strict';

const table = '"componentText"';
const column = 'type';
const types = [
  'donut',
  'calendar',
  'percentText',
  'iconText',
  'donutSelection',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_componentText_types";
      `);
    } catch (error) {}
    try {
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_componentText_type";
      `);
    } catch (error) {}
    try {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.DataTypes.ENUM(...types),
        allowNull: false,
        defaultValue: 'iconText', // only for dev env..
      });
    } catch (error) {}

    // need to drop enum...
    await queryInterface.changeColumn(table, column, {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    });

    try {
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_componentText_types";
      `);
    } catch (error) {}
    try {
      await queryInterface.sequelize.query(`
        DROP TYPE "enum_componentText_type";
      `);
    } catch (error) {}

    await queryInterface.changeColumn(table, column, {
      type: Sequelize.ENUM(...types),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {},
};
