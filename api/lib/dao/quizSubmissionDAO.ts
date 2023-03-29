import { QuizSubmissionCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class QuizSubmissionDAO extends DAO<'QuizSubmissionDB'> {
  // This will return the latest quiz submission
  async findLatestByQuizId(context: ContextQuery, quizId: string) {
    const builder = this.where();
    builder.merge({ quizId });
    builder.context(context);

    const submission = await this.repo.findOne({
      order: [['completedAt', 'DESC']],
      where: builder.build(),
    });

    return this.toJSON(submission);
  }

  async create(context: ContextQuery, payload: QuizSubmissionCreateDAO) {
    const builder = this.where();
    builder.context(context);

    const submission = await this.repo.create(payload);

    return this.toJSON(submission)!;
  }
}
