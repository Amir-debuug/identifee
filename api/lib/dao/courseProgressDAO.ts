import {
  CourseProgressCreateDAO,
  CourseProgressModifyDAO,
} from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class CourseProgressDAO extends DAO<'CourseProgressDB'> {
  // CourseProgress will return the latest
  async findOneByCourseId(context: ContextQuery, courseId: string) {
    const builder = this.where();
    builder.merge({ course_id: courseId });
    builder.context(context);

    const progress = await this.repo.findOne({
      order: [['started_at', 'DESC']],
      where: builder.build(),
    });

    return this.toJSON(progress);
  }

  async findOneInProgressByCourseId(context: ContextQuery, courseId: string) {
    const builder = this.where();
    builder.merge({ course_id: courseId, status: 'in_progress' });
    builder.context(context);

    const progress = await this.repo.findOne({
      order: [['started_at', 'DESC']],
      where: builder.build(),
    });

    return this.toJSON(progress);
  }

  async create(context: ContextQuery, payload: CourseProgressCreateDAO) {
    const builder = this.where();
    builder.context(context);

    const progress = await this.repo.create(payload);

    return this.toJSON(progress)!;
  }

  async updateById(
    context: ContextQuery,
    id: string,
    payload: CourseProgressModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [progress]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(progress);
  }
}
