import { Biz, UserQuery } from './utils';
import { Pagination } from 'lib/dao';
import { ActivityModifyBiz, ActivityQueryBiz } from 'lib/middlewares/sequelize';

export class ActivityBiz extends Biz {
  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: ActivityQueryBiz
  ) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.activity.findAll(context, pagination, query);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const activity = await this.services.dao.activity.findOneById(context, id);
    if (!activity) {
      throw new this.exception.ResourceNotFound('activity');
    }
    return activity;
  }

  async cancelById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const activity = await this.services.dao.activity.cancelById(context, id);
    if (!activity) {
      throw new this.exception.ResourceNotFound('activity');
    }
    return activity;
  }

  async completeById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const activity = await this.services.dao.activity.completeById(context, id);
    if (!activity) {
      throw new this.exception.ResourceNotFound('activity');
    }
    return activity;
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: ActivityModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const activity = await this.services.dao.activity.updateById(
      context,
      id,
      payload
    );

    return activity;
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);

    await this.services.dao.activity.deleteById(context, id);

    return;
  }
}
