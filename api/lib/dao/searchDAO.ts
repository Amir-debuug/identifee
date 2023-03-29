import { SearchCreateDAO, SearchModifyDAO } from 'lib/middlewares/sequelize';
import { v4 } from 'uuid';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class SearchDAO extends DAO<'SearchDB'> {
  async find(context: ContextQuery) {
    const builder = this.where();
    builder.context(context);

    const resurces = await this.repo.findAll({
      where: builder.build(),
    });

    return this.rowsToJSON(resurces);
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const search = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(search);
  }

  async create(payload: SearchCreateDAO) {
    const search = await this.repo.create(payload);

    return this.toJSON(search)!;
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: SearchModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [search]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });
    return this.toJSON(search);
  }

  async deleteById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    await this.repo.destroy({ where: builder.build() });

    return;
  }
}
