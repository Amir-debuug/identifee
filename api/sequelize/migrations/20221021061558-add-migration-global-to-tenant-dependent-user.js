'use strict';

const { v4 } = require('uuid');

const globalOwnerRoleId = 'a8cbe704-7201-4969-b6a7-a6d4b624cf1e';
const globalUserRoleId = '7842cf07-6501-4119-9b2c-0ae66ece2b15';

module.exports = {
  async up(queryInterface, Sequelize) {
    const [ownerRoleUsers] = await queryInterface.sequelize.query(`
      select u.id, u.tenant_id from users u where "roleId" = '${globalOwnerRoleId}';
    `);

    const [userRoleUsers] = await queryInterface.sequelize.query(`
      select u.id, u.tenant_id from users u where "roleId" = '${globalUserRoleId}';
    `);

    ownerRoleUsers.forEach(async (user) => {
      const tenant = user.tenant_id;
      const id = user.id;

      const [ownerRole] = await queryInterface.sequelize.query(`
        select r.id from roles r where app_access = true and owner_access = true and admin_access = false and tenant_id = '${tenant}';
      `);

      if (ownerRole.length) {
        await queryInterface.sequelize.query(`
          update users set "roleId" = '${ownerRole[0].id}' where id = '${id}';
        `);
      } else {
        const roleId = v4();

        await queryInterface.sequelize.query(`
          insert into roles ( id, name, icon, enforce_tfa, admin_access, app_access, owner_access, admin_access, tenant_id ) 
          values ( '${roleId}', 'Owner', 'supervised_user_circle', false, false, true, true, false, '${tenant}' );
        `);

        await queryInterface.sequelize.query(`
          update users set "roleId" = '${roleId}' where id = '${id}';
        `);
      }
    });

    userRoleUsers.forEach(async (user) => {
      const tenant = user.tenant_id;
      const id = user.id;

      const [userRole] = await queryInterface.sequelize.query(`
        select r.id from roles r where app_access = true and owner_access = false and admin_access = false and tenant_id = '${tenant}';
      `);

      if (userRole.length) {
        await queryInterface.sequelize.query(`
          update users set "roleId" = '${userRole[0].id}' where id = '${id}';
        `);
      } else {
        const roleId = v4();

        await queryInterface.sequelize.query(`
          insert into roles ( id, name, icon, enforce_tfa, admin_access, app_access, owner_access, admin_access, tenant_id ) 
          values ( '${roleId}', 'Application User', 'supervised_user_circle', false, false, true, false, false, '${tenant}' );
        `);

        await queryInterface.sequelize.query(`
          update users set "roleId" = '${roleId}' where id = '${id}';
        `);
      }
    });
  },

  async down(queryInterface, Sequelize) {},
};
