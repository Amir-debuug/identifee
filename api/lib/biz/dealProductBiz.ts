import { Pagination } from 'lib/types';
import { Biz, UserQuery } from './utils';

export class DealProductBiz extends Biz {
  async getProductsByDealId(
    override: UserQuery | undefined,
    pagination: Pagination,
    dealId: string
  ) {
    const context = await this.userQuery.build(override);
    const dealContext = await this.services.biz.deal.userQuery.build(context);

    const deal = this.services.dao.deal.findOneById(dealContext, dealId);

    if (!deal) {
      throw new this.exception.ResourceNotFound('Deal');
    }

    const products = await this.services.dao.dealProduct.getProductsByDealId(
      context,
      pagination,
      dealId
    );

    return products;
  }
}
