import { ActivityModifyDAO, ActivityQueryDAO } from 'lib/middlewares/sequelize';
import { Op } from 'sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class ActivityDAO extends DAO<'ActivityDB'> {
  async findAll(
    context: ContextQuery,
    pagination: Pagination,
    query: ActivityQueryDAO
  ) {
    const {
      type,
      done,
      startDate,
      endDate,
      order = ['created_at', 'DESC'],
      organizationId,
      dealId,
      contactId,
    } = query;

    const builder = this.where();
    builder.merge({ deleted_on: null });

    if (organizationId) {
      builder.merge({ organization_id: organizationId });
    }

    if (dealId) {
      builder.merge({ deal_id: dealId });
    }

    if (contactId) {
      builder.merge({ contact_id: contactId });
    }

    if (type) {
      builder.merge({ type });
    }

    if (typeof done === 'boolean') {
      builder.merge({ done });
    }

    if (startDate) {
      builder.merge({
        start_date: {
          [Op.gte]: startDate,
        },
      });
    }

    if (endDate) {
      builder.merge({
        end_date: {
          [Op.lt]: endDate,
        },
      });
    }

    if (context.userId) {
      builder.merge({ created_by: context.userId });
      delete context.userId;
    }

    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      order: [order],
      include: ['organization', 'deal', 'contact', 'owners'],
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deleted_on: null });
    builder.context(context);

    const activity = await this.repo.findOne({
      include: ['organization', 'deal', 'contact', 'owners'],
      where: builder.build(),
    });

    return this.toJSON(activity);
  }

  async cancelById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deleted_on: null });
    builder.merge({ canceledOn: null });
    builder.context(context);

    const [, [activity]] = await this.repo.update(
      { canceledOn: new Date() },
      {
        where: builder.build(),
        returning: true,
      }
    );

    return this.toJSON(activity);
  }

  async completeById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deleted_on: null });
    builder.merge({ canceledOn: null });
    builder.context(context);

    const [, [activity]] = await this.repo.update(
      { done: true },
      {
        where: builder.build(),
        returning: true,
      }
    );

    return this.toJSON(activity);
  }

  async deleteById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deleted_on: null });
    builder.context(context);

    await this.repo.update(
      { deleted_on: new Date() },
      {
        where: builder.build(),
      }
    );

    return;
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: ActivityModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [activity]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });

    return this.toJSON(activity)!;
  }
}
