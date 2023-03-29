import { ActivityOwnerCreateBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class ActivityOwnerBiz extends Biz {
  async deleteByCompositeIds(
    override: UserQuery,
    activityId: string,
    userId: string
  ) {
    await this.services.dao.activity.findOneById(override, activityId);
    await this.services.dao.user.findOneById(override, userId);

    const context = await this.userQuery.build(override);

    await this.services.dao.activityOwner.deleteByCompositeIds(
      context,
      activityId,
      userId
    );

    return;
  }

  async bulkCreate(
    override: UserQuery | undefined,
    activityId: string,
    payloads: ActivityOwnerCreateBiz[]
  ) {
    const context = await this.userQuery.build(override);

    const data = payloads.map((payload) => {
      return {
        ...payload,
        activityId,
      };
    });

    await this.services.dao.activityOwner.bulkCreate(context, data);
  }
}
