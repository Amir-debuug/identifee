import { Pagination } from 'lib/types';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class DealProductDAO extends DAO<'DealProductDB'> {
  async getProductsByDealId(
    context: ContextQuery,
    pagination: Pagination,
    deal_id: string
  ) {
    const builder = this.where();
    builder.context(context);

    builder.merge({ deal_id });

    const { rows, count } = await this.repo.findAndCountAll({
      where: builder.build(),
      include: [
        {
          association: 'product',
          attributes: ['name', 'description', 'code', 'deleted'],
        },
      ],
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }
}
