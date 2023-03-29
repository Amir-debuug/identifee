'use strict';

const { v4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const [tenants] = await queryInterface.sequelize.query(`
      select t.id, t.name from tenants t;
    `);

    const bulkInserts = [];
    tenants.forEach((tenant) => {
      const t = tenant.id;
      const n = tenant.name;
      bulkInserts.push({
        id: v4(),
        name: n + ' pipeline',
        createdById: null,
        tenantId: t,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    if (bulkInserts.length === 0) {
      console.warn(`nothing to migrate due to length 0: ${bulkInserts}`);
      return;
    }

    await queryInterface.bulkInsert('pipeline', bulkInserts, {});
  },

  async down(queryInterface, Sequelize) {},
};
