import {
  FieldCreateDAO,
  FieldModifyDAO,
  FieldQueryBiz,
} from 'lib/middlewares/sequelize';
import { Pagination } from 'lib/types';
import { Transaction, TransactionOptions } from 'sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class FieldDAO extends DAO<'FieldDB'> {
  async bulkCreate(payloads: FieldCreateDAO[]) {
    const fields = await this.repo.bulkCreate(payloads);

    return this.rowsToJSON(fields);
  }

  async findByType(
    context: ContextQuery,
    pagination: Pagination,
    type: string
  ) {
    const builder = this.where();
    builder.context(context);
    builder.merge({ type });

    const { count, rows } = await this.repo.findAndCountAll({
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async find(
    context: ContextQuery,
    pagination: Pagination,
    options: FieldQueryBiz
  ) {
    const {
      type,
      usedField,
      preferred,
      order = ['updated_at', 'asc'],
    } = options;

    const builder = this.where();
    builder.context(context);
    builder.merge({ type });

    if (usedField) {
      builder.merge({ usedField });
    }

    if (preferred) {
      builder.merge({ preferred });
    }

    const { count, rows } = await this.repo.findAndCountAll({
      where: builder.build(),
      order: [order, ['created_at', 'ASC']],
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async create(context: ContextQuery, payload: FieldCreateDAO) {
    const field = await this.repo.create(payload);

    return this.toJSON(field)!;
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const field = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(field);
  }

  async deleteById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    await this.repo.destroy({
      where: builder.build(),
    });

    return;
  }

  async updateById(context: ContextQuery, id: string, payload: FieldModifyDAO) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [field]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });

    return this.toJSON(field);
  }

  async setPreference(
    context: ContextQuery,
    type: string,
    id: string[],
    opts: TransactionOptions = {}
  ) {
    const defaultBuilder = this.where();
    defaultBuilder.context(context);
    defaultBuilder.merge({ type });

    const idBuilder = this.where();
    idBuilder.context(context);
    idBuilder.merge({ id });

    return this.transaction(
      {
        ...opts,
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        await this.repo.update(
          { preferred: false },
          {
            where: defaultBuilder.build(),
            transaction,
          }
        );

        await this.repo.update(
          { preferred: true },
          {
            where: idBuilder.build(),
            transaction,
          }
        );

        return;
      }
    );
  }
}
