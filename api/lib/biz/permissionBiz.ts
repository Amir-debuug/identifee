import {
  PermissionAttr,
  PermissionUpsertBiz,
  permissions,
} from 'lib/middlewares/sequelize';
import { Transaction } from 'sequelize';
import { Biz, UserQuery } from './utils';

export class PermissionBiz extends Biz {
  async getAllByRoleId(override: UserQuery | undefined, roleId: string) {
    const context = await this.userQuery.build(override);

    const role = await this.services.biz.role.getOneById(override, roleId);

    if (!role.admin_access && !role.owner_access) {
      const rolePermissions =
        await this.services.dao.permission.findAllByRoleId(context, roleId);

      return rolePermissions;
    }

    const { privileged, ...rest } = permissions;

    return Object.values(rest).reduce((acc, permission) => {
      return acc.concat(
        ...Object.values(permission).map(({ collection, action }) => {
          return {
            collection,
            action,
            role: roleId,
            tenant_id: role.tenant_id,
          };
        })
      );
    }, [] as PermissionAttr[]);
  }

  async bulkSetByRoleId(
    override: UserQuery | undefined,
    roleId: string,
    payloads: PermissionUpsertBiz[]
  ) {
    const role = await this.services.biz.role.getOneById(override, roleId);

    return this.services.dao.permission.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        await this.services.dao.permission.deleteByRoleId(
          { tenantId: role.tenant_id },
          roleId,
          { transaction }
        );

        return this.services.dao.permission.bulkUpsert(
          { tenantId: role.tenant_id },
          payloads.map((payload) => ({
            ...payload,
            tenant_id: role.tenant_id,
            role: roleId,
          })),
          { transaction }
        );
      }
    );
  }
}
