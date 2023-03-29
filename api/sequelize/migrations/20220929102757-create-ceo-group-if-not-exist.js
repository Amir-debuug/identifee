'use strict';

const { v4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [tenants] = await queryInterface.sequelize.query(`
      select t.id from tenants t;
    `);

    const bulkInserts = [];
    tenants.forEach((tenant) => {
      const t = tenant.id;
      bulkInserts.push({
        id: v4(),
        name: 'CEO',
        parent_id: null,
        tenant_id: t,
        created_at: new Date(),
        updated_at: new Date(),
      });
    });

    if (bulkInserts.length === 0) {
      console.warn(`nothing to migrate due to length 0: ${bulkInserts}`);
      return;
    }

    await queryInterface.bulkInsert('groups', bulkInserts, {});
  },

  async down(queryInterface, Sequelize) {},
};
