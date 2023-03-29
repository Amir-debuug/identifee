import {
  PipelineCreateDAO,
  PipelineModifyDAO,
  PipelineQueryDAO,
  TenantDealStageAttr,
} from 'lib/middlewares/sequelize';
import { Transaction, TransactionOptions } from 'sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class PipelineDAO extends DAO<'PipelineDB'> {
  async find(
    context: ContextQuery,
    pagination: Pagination,
    query: PipelineQueryDAO
  ) {
    const builder = this.where();
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      order: query.order ? [query.order] : undefined,
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const pipeline = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(pipeline);
  }

  async create(payload: PipelineCreateDAO) {
    const pipeline = await this.repo.create(payload);

    return this.toJSON(pipeline)!;
  }

  async cloneById(context: ContextQuery, id: string) {
    const pipeline = await this.findOneById(context, id);

    if (!pipeline) {
      return;
    }

    delete (pipeline as any).id;
    const clonePipeline = await this.repo.create(pipeline);

    return this.toJSON(clonePipeline);
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: PipelineModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [pipeline]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });
    return this.toJSON(pipeline);
  }

  async deleteById(
    context: ContextQuery,
    id: string,
    transferId: string | undefined
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const stages = await this.services.dao.tenantDealStage.findAllByPipelineId(
      context,
      id
    );

    const stageIds = stages.map((stage: TenantDealStageAttr) => {
      return stage.id as string;
    });

    if (transferId) {
      await this.services.dao.deal.updateStageId(stageIds, transferId);
    }

    await this.services.dao.tenantDealStage.bulkDeleteByStageIds({}, stageIds);
    await this.services.dao.pipelineTeam.deleteById(context, id);
    await this.repo.destroy({ where: builder.build() });

    return;
  }

  async countDeals(context: ContextQuery, id: string) {
    const stages = await this.services.dao.tenantDealStage.findAllByPipelineId(
      context,
      id
    );

    const stageIds = stages.map((stage: TenantDealStageAttr) => {
      return stage.id as string;
    });

    const deals = await this.services.dao.deal.findAllByStageIds(stageIds);
    return { totalDeals: deals.length };
  }

  async setIsDefault(
    context: ContextQuery,
    id: string,
    opts: TransactionOptions = {}
  ) {
    const defaultBuilder = this.where();
    defaultBuilder.context(context);

    const IdBuilder = this.where();
    IdBuilder.context(context);
    IdBuilder.merge({ id });

    return await this.transaction(
      {
        ...opts,
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        await this.repo.update(
          {
            isDefault: false,
          },
          {
            where: defaultBuilder.build(),
            transaction,
          }
        );

        const [, [pipeline]] = await this.repo.update(
          {
            isDefault: true,
          },
          {
            where: IdBuilder.build(),
            transaction,
            returning: true,
          }
        );

        return pipeline;
      }
    );
  }
}
