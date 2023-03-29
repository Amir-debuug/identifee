'use strict';

const { v4 } = require('uuid');

const emails = [
  'vram@identifee.com',
  'kevin@identifee.com',
  'vigen@identifee.com',
  'yasir.abbas@fore.studio',
  'razzaq.tahir@gmail.com',
  'mobeenikhtiar21@gmail.com',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const [tenants] = await queryInterface.sequelize.query(
      `SELECT t.id FROM tenants t WHERE type = 'admin'`
    );

    await queryInterface.bulkUpdate(
      'roles',
      { admin_access: false, owner_access: true },
      { admin_access: true }
    );

    // just have one tenant which type is admin
    const adminTenant = tenants[0];
    if (!adminTenant) {
      console.warn('!!!!!');
      console.warn('!!!!!');
      console.warn('!!!!!');
      console.warn('admin tenant must be created manually');
      console.warn('!!!!!');
      console.warn('!!!!!');
      console.warn('!!!!!');
      return;
    }

    await queryInterface.sequelize.query(`
      INSERT INTO roles ( id, name, icon, enforce_tfa, admin_access, app_access, owner_access, tenant_id ) 
      VALUES ( '${v4()}', 'Admin', 'supervised_user_circle', false, true, false, false, '${
      adminTenant?.id
    }' );
  `);

    const [roles] = await queryInterface.sequelize.query(
      `SELECT r.id FROM roles r WHERE name = 'Admin' AND admin_access = true`
    );

    // just have one admin role
    const adminRole = roles[0];

    await queryInterface.sequelize.query(`
      UPDATE users SET "roleId" = '${adminRole.id}', tenant_id = '${
      adminTenant?.id
    }' WHERE email IN (${emails.map((email) => `'${email}'`).join(',')});
  `);
  },
};
