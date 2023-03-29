import { QuizCreateSubmissionBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class QuizBiz extends Biz {
  async findOneById(override: UserQuery | undefined, quizId: string) {
    const context = await this.userQuery.build(override);

    const quiz = await this.services.dao.quiz.findOneById(context, quizId);
    if (!quiz) {
      throw new this.exception.ResourceNotFound('quiz');
    }
    return quiz;
  }

  async submitQuiz(
    override: UserQuery | undefined,
    quizId: string,
    payload: QuizCreateSubmissionBiz
  ) {
    const context = await this.userQuery.build(override);

    const quiz = await this.findOneById(override, quizId);

    const answers = quiz.questions.map((question) => {
      const isCorrect = payload.answers.some(
        (payload) =>
          payload.quizQuestionId === question.quizQuestionId &&
          question.choices.some(
            (choice) => choice.id === payload.id && choice.correct
          )
      );

      return {
        quizQuestionId: question.quizQuestionId,
        isCorrect,
      };
    });
    const totalCorrect = answers.reduce(
      (acc, { isCorrect }) => (isCorrect ? acc + 1 : 0),
      0
    );

    const submission = await this.services.dao.quizSubmission.create(context, {
      quizId,
      userId: this.user.id,
      score: (totalCorrect / quiz.questions.length) * 100,
      completedAt: new Date(),
    });
    await Promise.all(
      answers.map((answer) =>
        this.services.dao.quizQuestionSubmission.create(context, {
          correct: answer.isCorrect,
          quizQuestionId: answer.quizQuestionId,
          quizSubmissionId: submission.quizSubmissionId,
          userId: this.user.id,
        })
      )
    );

    return submission;
  }
}
