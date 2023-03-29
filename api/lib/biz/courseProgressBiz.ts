import {
  CourseProgressUpsertBiz,
  LessonAttr,
  QuizCreateSubmissionBiz,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class CourseProgressBiz extends Biz {
  async getOneByCourseId(override: UserQuery | undefined, courseId: string) {
    const context = await this.userQuery.build(override);

    let [course, progress, courseContent] = await Promise.all([
      this.services.dao.course.findOneById<{ lessons: LessonAttr[] }>(
        context,
        courseId,
        {
          lessons: 'required',
        }
      ),
      this.services.dao.courseProgress.findOneByCourseId(context, courseId),
      this.services.dao.courseContent.findByCourseId(context, courseId, {
        limit: 1000,
        page: 1,
      }),
    ]);

    if (!course) {
      throw new this.exception.ResourceNotFound('courseProgress');
    }
    // quick hacky workaround
    if (!progress) {
      progress = await this.services.dao.courseProgress.create(context, {
        last_attempted_at: new Date(),
        status: 'in_progress',
        course_id: courseId,
        started_at: new Date(),
        tenant_id: this.user.tenant,
        user_id: this.user.id,
      });
    }
    let lessonProgressCount = 0.0;
    const completedLessons = await Promise.all(
      course.lessons.map(async (lesson) => {
        try {
          const { status, progress } =
            await this.services.biz.lessonProgress.getOneByLessonId(
              override,
              lesson.id
            );
          if (Number(progress || '0') > 0) {
            lessonProgressCount =
              lessonProgressCount + Number(progress || '0') / 100;
          }
          return (
            status === 'completed' ||
            (status === 'failed' && Number(progress || '0') >= 100)
          );
        } catch (error) {
          return false;
        }
      })
    );
    const totalCompletedLessons = completedLessons.filter(
      (lesson) => !!lesson
    ).length;
    const courseProgress = Number(progress.progress || '0');
    // checking is course is completed & no lessons is in progress, return actual course progress
    if (
      (courseProgress || 0) >= 100 &&
      totalCompletedLessons === course.lessons.length
    ) {
      return progress;
    } else {
      const correctedProgress = // only need to calculate  lessons progress as if quiz taken progress will be 100 and completed always,  we are showing retake course
        (lessonProgressCount /
          (courseContent.pagination.count + course.lessons.length)) *
        100;

      // TODO revisit this. Hacky quick fix but will revisit
      await this.services.dao.courseProgress.updateById(context, progress.id, {
        ...progress,
        status:
          correctedProgress >= 100
            ? ('completed' as const)
            : ('in_progress' as const),
        progress: correctedProgress,
      });
      return {
        ...progress,
        status:
          correctedProgress >= 100
            ? ('completed' as const)
            : ('in_progress' as const),
        progress: correctedProgress,
      };
    }
  }

  async submitQuiz(
    override: UserQuery | undefined,
    courseId: string,
    quizId: string,
    payload: QuizCreateSubmissionBiz
  ) {
    const context = await this.userQuery.build(override);

    const contents = await this.services.dao.courseContent.findByCourseId(
      context,
      courseId,
      { limit: 1000, page: 1 }
    );
    const quizContent = contents.data.find(
      (content) => content.quizId === quizId
    );
    // not associated to course
    if (!quizContent) {
      throw new this.exception.ResourceNotFound('courseContent');
    }

    const submission = await this.services.biz.quiz.submitQuiz(
      override,
      quizId,
      payload
    );

    let progress =
      await this.services.dao.courseProgress.findOneInProgressByCourseId(
        context,
        courseId
      );
    if (!progress) {
      progress = await this.services.dao.courseProgress.create(context, {
        course_id: courseId,
        tenant_id: this.user.tenant,
        user_id: this.user.id,
        last_attempted_at: new Date(),
        started_at: new Date(),
        status: 'in_progress',
        courseContentId: quizContent.courseContentId,
      });
    }

    await this.services.dao.courseProgressQuizSubmission.create(context, {
      courseProgressId: progress.id,
      quizSubmissionId: submission.quizSubmissionId,
    });

    return submission;
  }

  async continue(
    override: UserQuery | undefined,
    courseId: string,
    payload: CourseProgressUpsertBiz
  ) {
    const context = await this.userQuery.build(override);

    const course = await this.services.biz.course.getOneById(context, courseId);
    const courseLessons = await this.services.dao.course.findOneById<{
      lessons: LessonAttr[];
    }>(context, courseId, {
      lessons: 'required',
    });
    // shouldn't happen
    if (!courseLessons) {
      throw new this.exception.InternalServerError();
    }
    const { lessons } = courseLessons;

    const trackedLessons = await Promise.all(
      lessons.map(async (lesson) => {
        try {
          const progress =
            await this.services.biz.lessonProgress.getOneByLessonId(
              context,
              lesson.id
            );
          return progress;
        } catch (error) {}
      })
    );
    const completedModules = trackedLessons
      .filter((trackedLesson) => !!trackedLesson)
      .reduce((acc, trackedLesson) => {
        const status = trackedLesson?.status;
        return acc + (['completed', 'failed'].includes(status || '') ? 1 : 0);
      }, 0);
    const requiredModules = lessons.length;
    const overallLessonProgress = Math.ceil(
      (completedModules / requiredModules) * 100
    );
    const isLessonCompleted = overallLessonProgress >= 100;

    // not every course has contents
    const totalCourseContents = course.contents.length;
    const [idxStr, courseContent] =
      Object.entries(course.contents).find(([idx, content]) => {
        return content.courseContentId === payload.courseContentId;
      }) || [];

    const hasContent = course.contents.length > 0;
    let newProgress = null;
    let isContentCompleted = false;
    if (courseContent) {
      if (!payload.courseContentId) {
        payload.courseContentId = courseContent.courseContentId;
      }

      newProgress = Math.round(
        ((Number(idxStr || '-1') + 1) / totalCourseContents) * 100
      );
      isContentCompleted = newProgress >= 100;
    }

    let progress =
      await this.services.dao.courseProgress.findOneInProgressByCourseId(
        context,
        courseId
      );

    const hasCompleted = isLessonCompleted && isContentCompleted;
    let pointsEarned = null;
    let score = null;

    // TODO change these values
    const defaultMaxPoints = 100; // TODO get from tenant config
    const defaultPassingScore = 70; // TODO get from tenant config

    if (isContentCompleted) {
      const quizContent = course.contents.filter((content) => !!content.quizId);

      const totalScore =
        await this.services.biz.quizSubmission.bulkCalculateScore(
          override,
          quizContent.map((page) => page.quizId!)
        );

      score = (totalScore / 100 / quizContent.length) * 100;
      pointsEarned = (score / 100) * defaultMaxPoints;
    }

    const currentProgress = {
      last_attempted_at: new Date(),
      courseContentId: payload.courseContentId,
      completed_at: hasCompleted ? new Date() : null,
      progress:
        (overallLessonProgress +
          (hasContent && newProgress !== null ? newProgress : 100)) /
        2,
      points: pointsEarned,
      score,
      status:
        hasCompleted && score !== null && Number.isInteger(score)
          ? score >= defaultPassingScore
            ? ('completed' as const)
            : ('failed' as const)
          : hasCompleted
          ? ('completed' as const)
          : ('in_progress' as const),
    };

    if (!progress) {
      progress = await this.services.dao.courseProgress.create(context, {
        ...currentProgress,
        course_id: courseId,
        started_at: new Date(),
        tenant_id: this.user.tenant,
        user_id: this.user.id,
      });
    } else {
      progress = await this.services.dao.courseProgress.updateById(
        context,
        progress.id,
        {
          ...progress,
          ...currentProgress,
        }
      );
    }

    return progress!;
  }
}
