class Migration {
  async hasColumn(queryInterface, table, column) {
    const definition = await queryInterface.describeTable(table);

    // case sensitive columns need double quotes
    return !!definition[column.replace(/"/g, '')];
  }

  async hasConstraint(queryInterface, table, constraint) {
    const indexes = await queryInterface.getForeignKeyReferencesForTable(table);

    return indexes.some(({ constraintName }) => constraintName === constraint);
  }

  alterColumn(action, table, column, attrs, opts = {}) {
    if (action !== 'add' && action !== 'remove') {
      throw new Error('action must be add or remove');
    }

    const removeColumn = async (queryInterface, Sequelize) => {
      const hasColumn = await this.hasColumn(queryInterface, table, column);
      if (!hasColumn) {
        console.warn(
          `table ${table} already removed column ${column}, skipping remove`
        );
        return true;
      }

      return queryInterface.sequelize.transaction((t) => {
        return queryInterface.removeColumn(table, column, {
          transaction: t,
        });
      });
    };
    const addColumn = async (queryInterface, Sequelize) => {
      const hasColumn = await this.hasColumn(queryInterface, table, column);
      if (hasColumn) {
        console.warn(
          `table ${table} already contains column ${column}, skipping add`
        );
        return true;
      } else {
        await queryInterface.addColumn(table, column, attrs);
      }

      if (!opts || !opts.foreign) {
        return;
      }
      const { foreign } = opts;

      const fKey = `"${table}_${column}_fkey"`;
      const hasConstraint = await this.hasConstraint(
        queryInterface,
        table,
        fKey
      );
      if (!hasConstraint) {
        await queryInterface.addConstraint(table, {
          name: fKey,
          fields: [column],
          type: 'foreign key',
          references: {
            table: foreign.table,
            field: foreign.field,
          },
        });
      }
    };

    return {
      up: action === 'add' ? addColumn : removeColumn,
      down: action === 'add' ? removeColumn : addColumn,
    };
  }

  async alterEnum(table, column, opts) {
    /**
     * Changing a postgres enum type requires dropping the enum type and recreating it.
     *
     * Before doing so, the column should also be changed to string type, and then back to enum type.
     */

    return {
      up: async (queryInterface, Sequelize) => {
        await queryInterface.changeColumn(table, column, {
          ...opts,
          type: Sequelize.DataTypes.STRING,
        });

        // ignore error if enum type does not exist
        try {
          await queryInterface.sequelize.query(`
          DROP TYPE "enum_${table}_${column}";
        `);
        } catch (error) {}

        await queryInterface.changeColumn(table, column, opts);
      },
      down: async (queryInterface, Sequelize) => {},
    };
  }

  async createTable(table, attrs, opts) {
    return {
      up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
          return queryInterface.createTable(table, attrs, {
            ...opts,
            transaction: t,
          });
        });
      },

      down: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.transaction((t) => {
          return queryInterface.dropTable(table, {
            ...opts,
            transaction: t,
          });
        });
      },
    };
  }

  removeConstraint(table, constraint, attrs, opts) {
    return {
      up: async (queryInterface, Sequelize) => {
        const hasConstraint = await this.hasConstraint(
          queryInterface,
          table,
          constraint
        );
        if (!hasConstraint) {
          console.warn(
            `table ${table} does not have constraint ${constraint}, skipping remove`
          );
          return true;
        }

        return queryInterface.removeConstraint(table, constraint);
      },

      down: async (queryInterface, Sequelize) => {
        // TODO revisit this
        return queryInterface.addConstraint(table, constraint);
      },
    };
  }
}

module.exports = new Migration();
