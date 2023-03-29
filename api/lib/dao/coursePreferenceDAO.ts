import { CoursePreferenceCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class CoursePreferenceDAO extends DAO<'CoursePreferenceDB'> {
  async findOneByCompositeIds(
    context: ContextQuery,
    courseId: string,
    userId: string
  ) {
    const builder = this.where();
    builder.merge({
      courseId,
      userId,
    });

    const preference = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(preference);
  }

  async upsert(context: ContextQuery, payload: CoursePreferenceCreateDAO) {
    const [preference] = await this.repo.upsert(payload, { returning: true });

    return this.toJSON(preference)!;
  }
}
