import { QuizQuestionModifyDAO } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class QuizQuestionBiz extends Biz {
  async findAllByQuizId(override: UserQuery | undefined, quizId: string) {
    const context = await this.userQuery.build(override);

    const questions = await this.services.dao.quizQuestion.findAllByQuizId(
      context,
      quizId
    );

    return questions;
  }

  async updateById(
    override: UserQuery | undefined,
    quizQuestionId: string,
    payload: QuizQuestionModifyDAO
  ) {
    const context = await this.userQuery.build(override);

    const updated = await this.services.dao.quizQuestion.updateById(
      context,
      quizQuestionId,
      payload
    );

    return updated;
  }
}
