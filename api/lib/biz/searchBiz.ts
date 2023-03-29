import { SearchCreateBiz, SearchModifyBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class SearchBiz extends Biz {
  async get(override: UserQuery | undefined) {
    const context = await this.userQuery.build(override);

    return this.services.dao.search.find(context);
  }

  async create(override: UserQuery | undefined, payload: SearchCreateBiz) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.search.create({
      ...payload,
      userId: this.user.id,
      tenantId: context.tenantId,
    });
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: SearchModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const search = await this.services.dao.search.updateById(
      context,
      id,
      payload
    );
    if (!search) {
      throw new this.exception.ResourceNotFound('resouce');
    }
    return search;
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const search = await this.services.dao.search.findOneById(context, id);
    if (!search) {
      throw new this.exception.ResourceNotFound('search');
    }
    return search;
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);

    await this.services.dao.search.deleteById(context, id);

    return;
  }
}
