import {
  ComponentTextCreateDAO,
  ComponentTextModifyDAO,
} from 'lib/middlewares/sequelize';
import { TransactionOptions } from 'sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class ComponentTextDAO extends DAO<'ComponentTextDB'> {
  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const componentText = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(componentText);
  }

  async create(payload: ComponentTextCreateDAO, opts: TransactionOptions = {}) {
    const componentText = await this.repo.create(payload, opts);

    return this.toJSON(componentText)!;
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: ComponentTextModifyDAO,
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [componentText]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
      ...opts,
    });

    return this.toJSON(componentText);
  }

  async deleteById(
    context: ContextQuery,
    id: string | string[],
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    await this.repo.destroy({
      where: builder.build(),
      ...opts,
    });
  }
}
