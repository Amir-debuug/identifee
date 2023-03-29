import { TenantDealStageAttr } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class TenantDealStageDAO extends DAO<'TenantDealStageDB'> {
  async findAllByPipelineId(
    context: ContextQuery,
    pipelineId: string | undefined
  ) {
    const builder = this.where();
    builder.merge({ pipelineId });

    const stages = await this.repo.findAll({
      where: builder.build(),
      order: [['created_at', 'ASC']],
    });

    return this.rowsToJSON(stages);
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });

    const stage = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(stage);
  }

  async deleteById(
    context: ContextQuery,
    id: string,
    transferId: string | undefined
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    if (transferId) {
      await this.services.dao.deal.updateStageId([id], transferId);
    } else {
      await this.services.dao.deal.bulkDelete([id]);
    }

    await this.repo.destroy({ where: builder.build() });
    return;
  }

  async bulkCreate(context: ContextQuery, payloads: TenantDealStageAttr[]) {
    const stages = await this.repo.bulkCreate(payloads, {
      updateOnDuplicate: ['name', 'probability', 'pipelineId'],
    });
    return this.rowsToJSON(stages)!;
  }

  async bulkDeleteByStageIds(context: ContextQuery, stageIds: string[]) {
    const builder = this.where();
    builder.merge({ id: stageIds });

    await this.services.dao.deal.bulkDelete(stageIds);

    await this.repo.destroy({
      where: builder.build(),
    });

    return;
  }
}
