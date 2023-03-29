import { ActivityOwnerCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class ActivityOwnerDAO extends DAO<'ActivityOwnerDB'> {
  async deleteByCompositeIds(
    context: ContextQuery,
    activityId: string,
    userId: string
  ) {
    const builder = this.where();
    builder.merge({ activityId });
    builder.merge({ userId });
    builder.context(context);

    await this.repo.destroy({
      where: builder.build(),
    });

    return;
  }

  async bulkCreate(context: ContextQuery, payloads: ActivityOwnerCreateDAO[]) {
    const activityOwner = await this.repo.bulkCreate(payloads);

    return this.rowsToJSON(activityOwner)!;
  }
}
