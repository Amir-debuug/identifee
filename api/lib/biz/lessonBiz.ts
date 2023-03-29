import { ContextQuery, Pagination } from 'lib/dao';
import {
  GetLessonsQuery,
  LessonCreateBiz,
  LessonModifyBiz,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class LessonBiz extends Biz {
  async getSelfContext(
    override: UserQuery | undefined,
    query: GetLessonsQuery
  ) {
    const tenantContext = await this.userQuery.build({
      ...override,
      // if we're filtering child associations, don't restrict parent to self
      self: query.favorites || query.progress ? false : override?.self,
    });

    const context: ContextQuery<'LessonDB'> = tenantContext;

    if (query.progress) {
      const userContext = await this.userQuery.build(override);
      context.progress = userContext;
    }
    // favorites is either favorites for self or lessons that have been favorited
    if (query.favorites) {
      const userContext = await this.userQuery.build(override);
      context.preference = userContext;
    }

    return context;
  }

  async getRandomLessonsWithUniqueCategoryId(override: UserQuery | undefined) {
    const context = await this.getSelfContext(override, {});

    const lessons =
      await this.services.dao.lesson.findRandomLessonsWithUniqueCategoryId(
        context
      );

    return lessons;
  }

  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: GetLessonsQuery
  ) {
    const context = await this.getSelfContext(override, query);

    // TODO is this really needed.........??????
    if (this.user.auth.isAdmin && !query.status) {
      query.status = ["eq 'published'", "eq 'draft'"];
    }

    let contactAccessible = false;

    if (this.user.auth.isGuest) {
      contactAccessible = true;
    }

    return this.services.dao.lesson.find(context, pagination, {
      ...query,
      contactAccessible,
    });
  }

  async getOneById(override: UserQuery | undefined, id: number) {
    const context = await this.userQuery.build(override);

    const lesson = await this.services.dao.lesson.findOneById(context, id);

    if (!lesson) {
      throw new this.exception.ResourceNotFound('lesson');
    }
    const adjustPages = await Promise.all(
      lesson.pages.map(async (page) => {
        if (page.type !== 'quiz') {
          return page;
        }
        const tempPage: typeof page & { qoption?: any[]; qtype?: string } = {
          ...page,
          qoption: [],
          qtype: 'mc',
        };
        if (tempPage.quizId) {
          const quizQuestions =
            await this.services.dao.quizQuestion.findAllByQuizId(
              {},
              tempPage.quizId
            );
          tempPage.qoption = quizQuestions[0].choices;
        }
        return tempPage;
      })
    );
    lesson.pages = adjustPages;

    return lesson;
  }

  async create(override: UserQuery | undefined, payload: LessonCreateBiz) {
    const context = await this.tenantQuery.build(override);

    if (payload.status === 'published' && this.user.auth.isAdmin) {
      payload.isPublic = true;
    }
    if (!payload.status) {
      payload.status = 'draft';
    }

    const lesson = await this.services.dao.lesson.create(context, {
      ...payload,
      tenant_id: context.tenantId,
    });

    return lesson;
  }

  async updateById(
    override: UserQuery | undefined,
    id: number,
    payload: LessonModifyBiz
  ) {
    const context = await this.userQuery.build(override);

    if (payload.status === 'published' && this.user.auth.isAdmin) {
      payload.isPublic = true;
    }

    const lesson = await this.services.dao.lesson.updateById(
      context,
      id,
      payload
    );
    if (!lesson) {
      throw new this.exception.ResourceNotFound('lesson');
    }

    return lesson;
  }

  async deleteById(override: UserQuery | undefined, id: number) {
    const context = await this.userQuery.build(override);

    const lesson = await this.services.dao.lesson.deleteById(context, id);
    if (!lesson) {
      throw new this.exception.ResourceNotFound('lesson');
    }

    return;
  }

  /**
   * @deprecated Just bring in old quiz code
   */
  async submitQuiz(
    override: UserQuery | undefined,
    id: number,
    pageId: number,
    answer: string
  ) {
    const context = await this.userQuery.build(override);

    const page = await this.services.dao.lessonPage.findOneByIdAndLessonId(
      context,
      pageId,
      id
    );
    if (!page) {
      throw new this.exception.ResourceNotFound('lessonPage');
    }

    if (!page.quizId) {
      throw new this.exception.Conflict('page does not have quiz');
    }

    const quiz = await this.services.dao.quiz.findOneById(context, page.quizId);
    // shouldn't happen
    if (!quiz) {
      throw new this.exception.InternalServerError();
    }
    // for now only expect one question
    if (quiz.questions.length !== 1) {
      throw new this.exception.InternalServerError();
    }
    const correctAnswer = quiz.questions[0].choices.find((a) => a.correct);
    if (!correctAnswer) {
      throw new this.exception.Conflict('quiz question has no correct answer');
    }

    const isCorrect = correctAnswer.id === answer;

    const submission = await this.services.dao.quizSubmission.create(context, {
      quizId: quiz.quizId,
      userId: this.user.id,
      score: isCorrect ? 100 : 0,
      completedAt: new Date(),
    });
    await this.services.dao.quizQuestionSubmission.create(context, {
      correct: isCorrect,
      quizQuestionId: quiz.questions[0].quizQuestionId,
      quizSubmissionId: submission.quizSubmissionId,
      userId: this.user.id,
    });

    let progress =
      await this.services.dao.lessonProgress.findOneInProgressByLessonId(
        context,
        id
      );
    if (!progress) {
      progress = await this.services.dao.lessonProgress.create(context, {
        lesson_id: id,
        tenant_id: this.user.tenant,
        user_id: this.user.id,
        last_attempted_at: new Date(),
        page_id: pageId,
        started_at: new Date(),
        status: 'in_progress',
      });
    }
    await this.services.dao.lessonProgressQuizSubmission.create(context, {
      lessonProgressId: progress.id,
      quizSubmissionId: submission.quizSubmissionId,
    });

    return isCorrect;
  }
}
