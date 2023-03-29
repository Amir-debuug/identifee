'use strict';

const Migration = require('../Migration');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hasColumn = await Migration.hasColumn(
      queryInterface,
      'users',
      'role'
    );
    if (!hasColumn) {
      console.warn('role column already migrated');
      return;
    }

    const [users] = await queryInterface.sequelize.query(`
      select id, role from users
      where role is not null;
    `);

    await Promise.all(
      users.map(async (user) => {
        const [[role]] = await queryInterface.sequelize.query(`
          select id from roles
          where id = '${user.role}';
        `);
        // role may have been deleted without updating user
        if (!role) {
          // nothing to do... column will be dropped
        } else {
          await queryInterface.sequelize.query(`
            update users
            set "roleId" = '${user.role}'
            where id = '${user.id}';
          `);
        }
      })
    );
  },

  async down(queryInterface, Sequelize) {},
};
