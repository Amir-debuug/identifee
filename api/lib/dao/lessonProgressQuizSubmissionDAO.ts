import { LessonProgressQuizSubmissionCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class LessonProgressQuizSubmissionDAO extends DAO<'LessonProgressQuizSubmissionDB'> {
  async create(
    context: ContextQuery,
    payload: LessonProgressQuizSubmissionCreateDAO
  ) {
    const builder = this.where();
    builder.context(context);

    const submission = await this.repo.create(payload);

    return this.toJSON(submission)!;
  }
}
