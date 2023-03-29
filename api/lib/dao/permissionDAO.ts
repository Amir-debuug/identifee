import { PermissionCreateDAO } from 'lib/middlewares/sequelize';
import { TransactionOptions } from 'sequelize/types';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class PermissionDAO extends DAO<'PermissionDB'> {
  async findAllByRoleId(context: ContextQuery, roleId: string) {
    const builder = this.where();
    builder.merge({ role: roleId });
    builder.context(context);

    const permissions = await this.repo.findAll({
      where: builder.build(),
    });

    return this.rowsToJSON(permissions);
  }

  async bulkUpsert(
    context: ContextQuery,
    payloads: PermissionCreateDAO[],
    opts: TransactionOptions = {}
  ) {
    const permissions = await Promise.all(
      payloads.map(async (payload) => {
        const [permission] = await this.repo.upsert(payload, {
          returning: true,
          ...opts,
        });
        return permission;
      })
    );

    return this.rowsToJSON(permissions);
  }

  async deleteByRoleId(
    context: ContextQuery,
    roleId: string,
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ role: roleId });
    builder.context(context);

    await this.repo.destroy({
      where: builder.build(),
      ...opts,
    });

    return;
  }
}
