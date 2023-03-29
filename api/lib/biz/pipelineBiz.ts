import { Pagination } from 'lib/dao';
import {
  PipelineCreateBiz,
  PipelineModifyBiz,
  PipelineQueryBiz,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class PipelineBiz extends Biz {
  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: PipelineQueryBiz
  ) {
    const context = await this.userQuery.build(override);

    return this.services.dao.pipeline.find(context, pagination, query);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const pipeline = await this.services.dao.pipeline.findOneById(context, id);
    if (!pipeline) {
      throw new this.exception.ResourceNotFound('pipeline');
    }
    return pipeline;
  }

  async create(override: UserQuery | undefined, payload: PipelineCreateBiz) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.pipeline.create({
      ...payload,
      createdById: this.user.id,
      tenantId: context.tenantId,
    });
  }

  async cloneById(override: UserQuery | undefined, pipelineId: string) {
    const context = await this.userQuery.build(override);

    const pipeline = await this.services.dao.pipeline.cloneById(
      context,
      pipelineId
    );

    if (!pipeline) {
      throw new this.exception.ResourceNotFound('pipeline');
    }

    return pipeline;
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: PipelineModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const pipeline = await this.services.dao.pipeline.updateById(
      context,
      id,
      payload
    );
    if (!pipeline) {
      throw new this.exception.ResourceNotFound('pipeline');
    }
    return pipeline;
  }

  async deleteById(
    override: UserQuery | undefined,
    id: string,
    transferId: string | undefined
  ) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);

    await this.services.dao.pipeline.deleteById(context, id, transferId);

    return;
  }

  async countDeals(override: UserQuery | undefined, id: string) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);

    return this.services.dao.pipeline.countDeals(context, id);
  }

  async setIsDefault(override: UserQuery | undefined, id: string) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);

    return this.services.dao.pipeline.setIsDefault(context, id);
  }
}
