import { Pagination } from 'lib/dao';
import {
  ActivityRequestCreateBiz,
  ActivityRequestModifyBiz,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class ActivityRequestBiz extends Biz {
  async get(override: UserQuery | undefined, pagination: Pagination) {
    const context = await this.userQuery.build(override);

    return this.services.dao.activityRequest.find(context, pagination);
  }

  async getOneById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const activityRequest = await this.services.dao.activityRequest.findOneById(
      context,
      id
    );
    if (!activityRequest) {
      throw new this.exception.ResourceNotFound('activityRequest');
    }
    return activityRequest;
  }

  async create(
    override: UserQuery | undefined,
    payload: ActivityRequestCreateBiz
  ) {
    const context = await this.userQuery.build(override);

    if (this.user.jwt.scope !== 'guest') {
      throw new this.exception.Conflict(
        'only contacts can create activity requests'
      );
    }

    const activityRequest = await this.services.dao.activityRequest.create(
      context,
      {
        ...payload,
        organizationId: this.user.jwt.resource_access.organization[0].id,
        tenantId: this.user.tenant,
        createdByContactId: this.user.jwt.contact_id,
      }
    );

    await this.emitter.emitAppEvent(this.user, {
      event: 'ACTIVITY_REQUEST_CREATED',
      payload: {
        activityRequest,
      },
    });

    return activityRequest;
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: ActivityRequestModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    const activityRequest = await this.services.dao.activityRequest.updateById(
      context,
      id,
      payload
    );
    if (!activityRequest) {
      throw new this.exception.ResourceNotFound('activityRequest');
    }
    return activityRequest;
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    await this.getOneById(override, id);

    const context = await this.userQuery.build(override);

    await this.services.dao.activityRequest.deleteById(context, id);
  }
}
