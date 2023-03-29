import { TenantConfigModifyBiz } from 'lib/middlewares/sequelize';
import { Biz, TenantQuery } from './utils';

export class TenantConfigBiz extends Biz {
  async upsertByTenantId(
    override: TenantQuery | undefined,
    tenantId: string,
    payload: TenantConfigModifyBiz
  ) {
    const context = await this.tenantQuery.build(override);

    await this.services.biz.tenant.getOneById(override, tenantId);

    const tenantConfig = await this.services.dao.tenantConfig.upsertByTenantId(
      context,
      tenantId,
      payload
    );
    return tenantConfig;
  }

  async getOneByTenantId(override: TenantQuery | undefined, tenantId: string) {
    const context = await this.tenantQuery.build(override);

    const tenantConfig = await this.services.dao.tenantConfig.findOneByTenantId(
      context,
      tenantId
    );
    if (!tenantConfig) {
      throw new this.exception.ResourceNotFound('tenant not found');
    }

    return tenantConfig;
  }
}
