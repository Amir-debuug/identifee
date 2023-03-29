'use strict';

const Migration = require('../Migration');

const table = 'component';
const column = 'componentTextId';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const promises = [];

    if (!(await Migration.hasColumn(queryInterface, table, column))) {
      promises.push(
        queryInterface.addColumn(table, column, {
          type: Sequelize.DataTypes.UUID,
          allowNull: true,
        })
      );
    }

    if (
      !(await Migration.hasConstraint(
        queryInterface,
        table,
        'component_componentTextId_fkey'
      ))
    ) {
      promises.push(
        queryInterface.addConstraint(table, {
          fields: [column],
          type: 'foreign key',
          references: {
            table: 'componentText',
            field: 'id',
          },
          onUpdate: 'cascade',
        })
      );
    }

    return Promise.all(promises);
  },

  down: async (queryInterface, Sequelize) => {},
};
