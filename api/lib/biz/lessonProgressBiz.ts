import { LessonProgressUpsertBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class LessonProgressBiz extends Biz {
  async getLatestByLessonIds(
    override: UserQuery | undefined,
    lessonIds: number[]
  ) {
    const context = await this.userQuery.build(override);

    const progresses =
      await this.services.dao.lessonProgress.findLatestByLessonIds(
        context,
        lessonIds
      );

    return progresses;
  }

  async getOneByLessonId(override: UserQuery | undefined, lessonId: number) {
    const context = await this.userQuery.build(override);

    const progress = await this.services.dao.lessonProgress.findOneByLessonId(
      context,
      lessonId
    );
    if (!progress) {
      throw new this.exception.ResourceNotFound('lessonProgress');
    }

    return progress;
  }

  async continue(
    override: UserQuery | undefined,
    lessonId: number,
    payload: LessonProgressUpsertBiz
  ) {
    const context = await this.userQuery.build(override);

    // TODO make lessonPages return public lesson
    const lesson = await this.services.biz.lesson.getOneById(context, lessonId);
    const totalLessonPages = lesson.pages.length;
    const [idxStr, lessonPage] =
      Object.entries(lesson.pages).find(([idx, page]) => {
        return page.id === payload.page_id;
      }) || [];

    if (!lessonPage && payload.page_id) {
      throw new this.exception.ResourceNotFound('lessonPage');
    }

    const newProgress = Math.round(
      ((Number(idxStr || '-1') + 1) / totalLessonPages) * 100
    );
    const isCompleted = newProgress >= 100;

    let progress =
      await this.services.dao.lessonProgress.findOneInProgressByLessonId(
        context,
        lessonId
      );

    const currentProgress = {
      status: isCompleted ? ('completed' as const) : ('in_progress' as const),
      last_attempted_at: new Date(),
      page_id: payload.page_id,
      completed_at: isCompleted ? new Date() : null,
      progress: newProgress,
    };

    if (!progress) {
      progress = await this.services.dao.lessonProgress.create(context, {
        ...currentProgress,
        lesson_id: lessonId,
        started_at: new Date(),
        tenant_id: this.user.tenant,
        user_id: this.user.id,
      });
    } else {
      // i know, i know. this feels sloppy and should be handled as an event
      // but that will require FE changes as they will have to poll until points
      // calculation is processed
      let pointsEarned = null;
      let score = null;

      // TODO change these values
      const defaultMaxPoints = 100; // TODO get from tenant config
      const defaultPassingScore = 70; // TODO get from tenant config

      const lessonQuizPages = lesson.pages.filter((page) => !!page.quizId);
      if (isCompleted && lessonQuizPages.length) {
        const totalScore =
          await this.services.biz.quizSubmission.bulkCalculateScore(
            override,
            lessonQuizPages.map((page) => page.quizId!)
          );

        score = (totalScore / 100 / lessonQuizPages.length) * 100;
        pointsEarned = (score / 100) * defaultMaxPoints;
      }

      progress = await this.services.dao.lessonProgress.updateById(
        context,
        progress.id,
        {
          ...progress,
          ...currentProgress,
          points: pointsEarned,
          status:
            isCompleted && score !== null && Number.isInteger(score)
              ? score >= defaultPassingScore
                ? ('completed' as const)
                : ('failed' as const)
              : isCompleted
              ? ('completed' as const)
              : ('in_progress' as const),
        }
      );
    }

    return progress!;
  }
}
