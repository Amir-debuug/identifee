'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.query(`
        UPDATE tenant_deal_stage SET "pipelineId" = pl.id FROM ( SELECT id, "tenantId" FROM pipeline ) AS pl WHERE pl."tenantId" = tenant_id;  
      `);
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {},
};
