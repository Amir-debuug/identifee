'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn(
        'course_progress', // name of Source model
        'user_id', // name of the key we're adding
        // attributes of the new column
        {
          type: 'UUID USING CAST("user_id" as UUID)',
        }
      ),
    ]);
  },
};
