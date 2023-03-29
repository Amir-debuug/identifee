import { TenantConfigModifyDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class TenantConfigDAO extends DAO<'TenantConfigDB'> {
  async findOneByTenantId(context: ContextQuery, tenantId: string) {
    const builder = this.where();
    builder.merge({ tenantId });

    const tenantConfig = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(tenantConfig);
  }

  async upsertByTenantId(
    context: ContextQuery,
    tenantId: string,
    payload: TenantConfigModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ tenantId });
    builder.context(context);

    const [tenantConfig] = await this.repo.upsert(
      { tenantId, ...payload },
      {
        returning: true,
      }
    );

    return this.toJSON(tenantConfig)!;
  }
}
