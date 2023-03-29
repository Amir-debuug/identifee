import { Biz, UserQuery } from './utils';

export class DealBiz extends Biz {
  async getAllAsStageSummary(
    override: UserQuery | undefined,
    query: {
      start_date?: string;
      end_date?: string;
      search?: string;
      status?: string;
    } & {
      [k in string]: any;
    }
  ) {
    const context = await this.userQuery.build(override);

    return this.services.dao.deal.findAllAsStageSummary(context, query);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const deal = await this.services.dao.deal.findOneById(context, id);
    if (!deal) {
      throw new this.exception.ResourceNotFound('deal');
    }

    return deal;
  }
}
