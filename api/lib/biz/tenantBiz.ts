import { Pagination } from 'lib/dao';
import {
  RoleAttr,
  TenantCreateBiz,
  TenantModifyBiz,
  TenantQueryBiz,
  UserCreateBiz,
} from 'lib/middlewares/sequelize';
import { userServiceFactory } from 'lib/services';
import { Biz, UserQuery } from './utils';

export class TenantBiz extends Biz {
  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: TenantQueryBiz
  ) {
    const context = await this.userQuery.build(override);

    return this.services.dao.tenant.find(context, pagination, query);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    // tenantId is null for super admins
    if (context.tenantId && context.tenantId !== id) {
      throw new this.exception.Forbidden('unable to view this tenant');
    }

    const tenant = await this.services.dao.tenant.findOneById(context, id);
    if (!tenant) {
      throw new this.exception.Forbidden('unable to view this tenant');
    }

    return tenant;
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: TenantModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const tenant = await this.services.dao.tenant.updateById(
      context,
      id,
      payload
    );
    if (!tenant) {
      throw new this.exception.ResourceNotFound('tenant');
    }
    return tenant;
  }

  async createTenant(
    override: UserQuery | undefined,
    tenantData: TenantCreateBiz,
    userData: UserCreateBiz
  ) {
    const context = await this.userQuery.build(override);

    const service = userServiceFactory(this.user);

    const tenant = await this.services.dao.tenant.findOneByDomain(
      context,
      tenantData.domain
    );

    const user = await this.services.dao.user.findOneByEmail(
      context,
      userData.email
    );

    if (user) {
      throw new this.exception.Conflict('user with this email already exist');
    }

    if (tenant) {
      throw new this.exception.Conflict(
        'tenant with this domain name already exist'
      );
    }

    const newTenant = await this.services.dao.tenant.createTenant(
      context,
      tenantData
    );

    if (!newTenant) {
      throw new this.exception.InvalidPayload('INVALID PAYLOAD');
    }

    const manager = await this.services.biz.group.createDefaultGroup(
      undefined,
      newTenant.id as string
    );
    const roles = await this.services.biz.role.createDefaultRole(
      newTenant.id as string
    );
    await this.services.biz.field.createDefault(
      { tenantId: newTenant.id },
      undefined
    );

    const [administration] = roles.filter(
      (role: RoleAttr) => role.name === 'Administrator'
    );

    try {
      await service.inviteUser(
        newTenant.id as string,
        userData,
        administration.id as string,
        manager.parent_id as string
      );
    } catch (error: any) {
      throw new this.exception.InvalidPayload('INVALID INVITE');
    }

    return newTenant;
  }
}
