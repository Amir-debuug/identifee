'use strict';

const Migration = require('../Migration');

const table = 'dashboard';
const column = 'organizationId';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (!(await Migration.hasColumn(queryInterface, table, column))) {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.DataTypes.UUID,
        allowNull: true,
      });
    }

    if (
      !(await Migration.hasConstraint(
        queryInterface,
        table,
        'dashboard_organizationId_fkey'
      ))
    ) {
      await queryInterface.addConstraint(table, {
        name: 'dashboard_organizationId_fkey',
        fields: [column],
        type: 'foreign key',
        references: {
          table: 'organizations',
          field: 'id',
        },
        onUpdate: 'cascade',
      });
    }
  },

  down: async (queryInterface, Sequelize) => {},
};
