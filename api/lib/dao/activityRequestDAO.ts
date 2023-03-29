import {
  ActivityRequestCreateDAO,
  ActivityRequestModifyDAO,
} from 'lib/middlewares/sequelize';
import { TransactionOptions } from 'sequelize/types';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class ActivityRequestDAO extends DAO<'ActivityRequestDB'> {
  async find(context: ContextQuery, pagination: Pagination) {
    const builder = this.where();
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ activityRequestId: id });
    builder.context(context);

    const activityRequest = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(activityRequest);
  }

  async create(context: ContextQuery, payload: ActivityRequestCreateDAO) {
    const activityRequest = await this.repo.create(payload);

    return this.toJSON(activityRequest)!;
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: ActivityRequestModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ activityRequestId: id });
    builder.context(context);

    const [, [activityRequest]] = await this.repo.update(payload, {
      where: { activityRequestId: id },
    });

    return this.toJSON(activityRequest);
  }

  async deleteById(
    context: ContextQuery,
    id: string,
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ activityRequestId: id });
    builder.context(context);

    await this.repo.destroy({
      where: { activityRequestId: id },
      ...opts,
    });
  }
}
