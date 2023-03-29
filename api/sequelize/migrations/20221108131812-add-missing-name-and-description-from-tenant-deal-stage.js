'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        UPDATE tenant_deal_stage SET name = ds.name FROM ( SELECT id, name, description FROM deal_stage ) AS ds WHERE ds.id = deal_stage_id;  
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {},
};
