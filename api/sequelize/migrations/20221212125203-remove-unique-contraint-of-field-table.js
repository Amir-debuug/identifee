'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE field DROP CONSTRAINT field_key_type_key;
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
};
