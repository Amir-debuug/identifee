import { NaicsQueryDAO } from 'lib/middlewares/sequelize';
import { Pagination } from './utils';
import DAO from './utils/DAO';

export class NaicsDAO extends DAO<'NaicsDB'> {
  async find(pagination: Pagination, query: NaicsQueryDAO) {
    const builder = this.where();

    if (query.search) {
      builder.iLike(query.search, 'title', 'code');
    }

    const { count, rows } = await this.repo.findAndCountAll({
      order: [['title', 'ASC']],
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async findOneByCode(code: string) {
    const naics = await this.repo.findByPk(code);

    return this.toJSON(naics);
  }
}
