import { CourseProgressQuizSubmissionCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class CourseProgressQuizSubmissionDAO extends DAO<'CourseProgressQuizSubmissionDB'> {
  async create(
    context: ContextQuery,
    payload: CourseProgressQuizSubmissionCreateDAO
  ) {
    const builder = this.where();
    builder.context(context);

    const submission = await this.repo.create(payload);

    return this.toJSON(submission)!;
  }
}
