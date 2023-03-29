'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn(
        'componentText', // name of Source model
        'text', // name of the key we're adding
        // attributes of the new column
        {
          type: Sequelize.DataTypes.TEXT,
        }
      ),
    ]);
  },
};
