import { LessonUpsertBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class LessonPageBiz extends Biz {
  async getAllById(override: UserQuery | undefined, lessonId: number) {
    const context = await this.userQuery.build(override);

    await this.services.biz.lesson.getOneById(override, lessonId);

    return this.services.dao.lessonPage.findAllByLessonId(context, lessonId);
  }

  async upsertByLessonId(
    override: UserQuery | undefined,
    lessonId: number,
    payload: LessonUpsertBiz
  ) {
    const context = await this.userQuery.build(override);

    await this.services.biz.lesson.getOneById(override, lessonId);

    const pages = await this.getAllById(override, lessonId);

    const idsToDelete = pages
      .filter((page) => {
        return payload.pages.every(({ id }) => id !== page.id);
      })
      .map((page) => page.id);
    if (idsToDelete.length) {
      await this.services.dao.lessonPage.deleteById(context, idsToDelete);
    }
    const containsInvalidPages = payload.pages
      .filter((page) => !!page.id)
      .some((page) => pages.every(({ id }) => id !== page.id));
    if (containsInvalidPages) {
      throw new this.exception.InvalidPayload('Invalid page id');
    }

    return Promise.all(
      payload.pages.map(async (p) => {
        const page = p as typeof p & {
          qtype?: string;
          qoption?: { [k in string]: any };
        };

        const data = { ...page, tenant_id: this.user.tenant };

        /**
         * maintaining backwards compatibility, i hate this...
         */
        let { quizId, qoption } = data;
        const shouldCreateQuizQuestion = !quizId && qoption;
        const shouldUpdateQuizQuestion = quizId && qoption;

        if (qoption && Array.isArray(qoption) && qoption.length) {
          if (!quizId) {
            const quiz = await this.services.dao.quiz.create(
              {},
              { maxAttempts: null }
            );
            data.quizId = quiz.quizId;
            quizId = quiz.quizId;
          }
          if (shouldCreateQuizQuestion) {
            await this.services.dao.quizQuestion.create(
              {},
              {
                choices: qoption,
                order: 1,
                quizId,
                type: 'multipleChoice',
              }
            );
          }
          if (shouldUpdateQuizQuestion) {
            const quizQuestions =
              await this.services.dao.quizQuestion.findAllByQuizId({}, quizId);
            await this.services.dao.quizQuestion.updateById(
              {},
              quizQuestions[0].quizQuestionId,
              { choices: qoption }
            );
          }
        }

        const { qoption: _qoption, qtype: _qtype, ...rest } = data;
        if (page.id) {
          return (await this.services.dao.lessonPage.updateById(
            context,
            page.id,
            rest
          ))!;
        }
        return this.services.dao.lessonPage.create(context, rest);
      })
    );
  }
}
