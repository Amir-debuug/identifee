import { QuizQuestionSubmissionCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class QuizQuestionSubmissionDAO extends DAO<'QuizQuestionSubmissionDB'> {
  async create(
    context: ContextQuery,
    payload: QuizQuestionSubmissionCreateDAO
  ) {
    const builder = this.where();
    builder.context(context);

    const submission = await this.repo.create(payload);

    return this.toJSON(submission)!;
  }
}
