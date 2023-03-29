import { Op, Model } from 'sequelize';

import { Lesson, LessonTracking, LessonPage, CourseLesson } from '../database';
import { LessonModel } from 'lib/database/models/lesson';
import { AuthUser } from 'lib/middlewares/auth';
import ContextQuery from './utils/ContextQuery';

abstract class LessonService extends ContextQuery<LessonModel> {
  /**
   * Provides tracking information for an array of lessons.
   */
  async trackBulk(lessonIds: number[]) {
    return await LessonTracking.findAll({
      // find the most recent
      order: [['updated_at', 'desc']],
      where: {
        lesson_id: lessonIds,
        user_id: this.user.id,
        tenant_id: this.user.tenant,
      },
    });
  }

  async findByCourseIds(rows: Array<Model>) {
    return await Promise.all(
      rows.map(async (row: any) => {
        const courseLessons = await CourseLesson.findAll({
          where: { course_id: row.dataValues.id },
        });
        const lessonsId = courseLessons.map((lesson) => lesson.id);
        const fetchLessons = await Lesson.findAll({
          where: { id: { [Op.in]: lessonsId } },
        });
        const lessons = fetchLessons.map((lesson) => lesson.toJSON());
        return { ...row.toJSON(), lessons };
      })
    );
  }

  async findPagesByLessonIds(rows: Array<Model>) {
    return await Promise.all(
      rows.map(async (row: any) => {
        const pages = await LessonPage.findAll({
          where: { lesson_id: row.dataValues.id },
        });
        return { ...row.toJSON(), pages };
      })
    );
  }
}

export class AdminLessonService extends LessonService {
  getContextQuery() {
    return {};
  }
}
export class OwnerLessonService extends LessonService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export class UserLessonService extends LessonService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export function LessonServiceFactory(user: AuthUser) {
  if (user?.auth?.isAdmin) {
    return new AdminLessonService(Lesson, user);
  } else if (user?.auth?.isOwner) {
    return new OwnerLessonService(Lesson, user);
  }
  return new UserLessonService(Lesson, user);
}
