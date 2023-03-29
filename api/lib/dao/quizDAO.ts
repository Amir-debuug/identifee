import { QuizCreateDAO, QuizQuestionAttr } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class QuizDAO extends DAO<'QuizDB'> {
  async findOneById(context: ContextQuery, quizId: string) {
    const builder = this.where();
    builder.merge({ quizId });
    builder.context(context);

    const quiz = await this.repo.findOne({
      include: ['questions'],
      where: builder.build(),
    });

    return this.toJSON<{ questions: QuizQuestionAttr[] }>(quiz);
  }

  async create(context: ContextQuery, payload: QuizCreateDAO) {
    const builder = this.where();
    builder.context(context);

    const quizDB = await this.repo.create(payload);

    return this.toJSON(quizDB)!;
  }
}
