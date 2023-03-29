import {
  QuizQuestionCreateDAO,
  QuizQuestionModifyDAO,
} from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class QuizQuestionDAO extends DAO<'QuizQuestionDB'> {
  async findAllByQuizId(context: ContextQuery, quizId: string) {
    const builder = this.where();
    builder.merge({ quizId });
    builder.context(context);

    const questions = await this.repo.findAll({
      where: builder.build(),
    });

    return this.rowsToJSON(questions);
  }

  async create(context: ContextQuery, payload: QuizQuestionCreateDAO) {
    const builder = this.where();
    builder.context(context);

    const quizQuestion = await this.repo.create(payload);

    return this.toJSON(quizQuestion)!;
  }

  async updateById(
    context: ContextQuery,
    quizQuestionId: string,
    payload: QuizQuestionModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ quizQuestionId });
    builder.context(context);

    const [, [updated]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(updated);
  }
}
