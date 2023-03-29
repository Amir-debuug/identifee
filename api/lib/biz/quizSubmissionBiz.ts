import { Biz, UserQuery } from './utils';

export class QuizSubmissionBiz extends Biz {
  async bulkCalculateScore(override: UserQuery | undefined, quizIds: string[]) {
    const context = await this.userQuery.build(override);

    const quizPoints = await Promise.all(
      quizIds.map(async (quizId) => {
        const quizSubmission =
          await this.services.dao.quizSubmission.findLatestByQuizId(
            context,
            quizId
          );

        return quizSubmission?.score || 0;
      })
    );

    return quizPoints.reduce((acc, points) => acc + points, 0);
  }
}
