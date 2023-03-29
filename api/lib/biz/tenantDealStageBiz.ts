import { TenantDealStageCreateBiz } from 'lib/middlewares/sequelize';
import { Biz, TenantQuery, UserQuery } from './utils';

export class TenantDealStageBiz extends Biz {
  async getAllByPipelineId(
    override: UserQuery | undefined,
    pipelineId: string | undefined
  ) {
    return this.services.dao.tenantDealStage.findAllByPipelineId(
      {},
      pipelineId
    );
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const stage = await this.services.dao.tenantDealStage.findOneById(
      context,
      id
    );
    if (!stage) {
      throw new this.exception.ResourceNotFound('deal stage');
    }
    return stage;
  }

  async delete(
    override: TenantQuery | undefined,
    stage_id: string,
    transferId: string | undefined
  ) {
    const context = await this.userQuery.build(override);

    const stage = await this.services.dao.tenantDealStage.findOneById(
      context,
      stage_id
    );
    if (!stage) {
      throw new this.exception.ResourceNotFound('stage');
    }

    return this.services.dao.tenantDealStage.deleteById(
      context,
      stage_id,
      transferId
    );
  }

  async bulkCreate(
    override: TenantQuery | undefined,
    payloads: TenantDealStageCreateBiz[]
  ) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.tenantDealStage.bulkCreate(context, payloads);
  }
}
