import { LessonPreferenceCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class LessonPreferenceDAO extends DAO<'LessonPreferenceDB'> {
  async findOneByCompositeIds(
    context: ContextQuery,
    lessonId: number,
    userId: string
  ) {
    const builder = this.where();
    builder.merge({
      lessonId,
      userId,
    });

    const preference = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(preference);
  }

  async upsert(context: ContextQuery, payload: LessonPreferenceCreateDAO) {
    const [preference] = await this.repo.upsert(payload, { returning: true });

    return this.toJSON(preference)!;
  }
}
