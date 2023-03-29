'use strict';

const table = 'video';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn(table, 'muxUploadId', {
      type: Sequelize.DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn(table, 'muxUploadUrl', {
      type: Sequelize.DataTypes.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {},
};
