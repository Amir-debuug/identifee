'use strict';

const Migration = require('../Migration');

const table = 'users';

module.exports = {
  async up(queryInterface, Sequelize) {
    // allow null before setting default
    await Migration.alterColumn('add', table, 'created_at', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    }).up(queryInterface, Sequelize);
    await Migration.alterColumn('add', table, 'updated_at', {
      type: Sequelize.DataTypes.DATE,
      allowNull: true,
    }).up(queryInterface, Sequelize);

    await queryInterface.sequelize.query(`
      update users set created_at = users.last_access where created_at is null;
    `);
    await queryInterface.sequelize.query(`
      update users set updated_at = users.last_access where updated_at is null;
    `);
    await queryInterface.sequelize.query(`
      update users set created_at = now() where created_at is null;
    `);
    await queryInterface.sequelize.query(`
      update users set updated_at = now() where updated_at is null;
    `);

    await queryInterface.sequelize.query(`
      alter table users
        alter column created_at type timestamp with time zone,
        alter column created_at set not null;
    `);
    await queryInterface.sequelize.query(`
      alter table users
        alter column updated_at type timestamp with time zone,
        alter column updated_at set not null;
    `);
  },

  async down(queryInterface, Sequelize) {},
};
