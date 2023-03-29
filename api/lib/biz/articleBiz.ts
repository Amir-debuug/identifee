import { Biz, UserQuery } from './utils';
import { ArticleModifyBiz } from 'lib/middlewares/sequelize';
import { Pagination } from 'lib/dao';

export class ArticleBiz extends Biz {
  async get(override: UserQuery | undefined, pagination: Pagination) {
    // self=true sets userId with a value, else is null
    const context = await this.userQuery.build({ ...override, self: true });
    return this.services.dao.article.find(context, pagination);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build({ ...override, self: true });

    const model = await this.services.dao.article.findOneById(context, id);
    if (!model) {
      throw new this.exception.ResourceNotFound('model');
    }
    return model;
  }

  async getOneByURL(override: UserQuery | undefined, url: string) {
    const context = await this.userQuery.build({ ...override, self: true });

    const model = await this.services.dao.article.findOneByURL(context, url);
    if (model) {
      throw new this.exception.Conflict('article is already added for user');
    }
    return model;
  }

  async create(override: UserQuery | undefined, payload: ArticleModifyBiz) {
    const context = await this.userQuery.build(override);
    // lets make sure we dont add duplicates bookmarks
    await this.getOneByURL(context, payload.url);

    return this.services.dao.article.create({
      ...payload,
      tenant_id: context.tenantId,
      user_id: this.user.id,
    });
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    // existence check
    await this.getOneById(override, id);
    // no need to do context check here, getOneById performs it
    await this.services.dao.article.deleteById({}, id);
  }
}
