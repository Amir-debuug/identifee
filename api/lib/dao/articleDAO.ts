import { ArticleCreateDAO, ArticleModifyDAO } from 'lib/middlewares/sequelize';
// import { Op, TransactionOptions } from 'sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class ArticleDAO extends DAO<'ArticleDB'> {
  async find(
    context: ContextQuery,
    pagination: Pagination
    //query: ArticleQueryDAO
  ) {
    const builder = this.where();
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
      order: [['published', 'DESC']],
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async create(payload: ArticleCreateDAO) {
    const article = await this.repo.create(payload);

    return this.toJSON(article)!;
  }

  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const model = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(model);
  }

  async findOneByURL(context: ContextQuery, url: string) {
    const builder = this.where();
    builder.merge({ url });
    builder.context(context);

    const model = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(model);
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: ArticleModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [model]] = await this.repo.update(payload, {
      where: builder.build(),
      returning: true,
    });

    return this.toJSON(model);
  }

  async deleteById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    await this.repo.destroy({
      where: builder.build(),
    });
  }
}
