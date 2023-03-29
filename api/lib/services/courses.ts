import {
  Category,
  CategoryCourse,
  Course,
  CourseLesson,
  Lesson,
  sequelize,
} from '../database';
import { BadgeAttributes } from '../database/models/badge';
import { CourseAttributes, CourseModel } from '../database/models/course';
import { LessonAttributes } from '../database/models/lesson';
import { InvalidPayload, ResourceNotFound } from 'lib/middlewares/exception';
import Base from './utils/Base';
import { AuthUser } from 'lib/middlewares/auth';
import { CategoryCourseServiceFactory } from './categoryCourse';

// TODO need to find a better way to make a generic type with include
type GetCourseLessonById = CourseAttributes & { badge: BadgeAttributes } & {
  lessons: LessonAttributes[];
};

class CourseService extends Base<CourseModel> {
  getContextQuery() {
    return {};
  }

  async findCourse(courseId: string) {
    const course = await Course.findOne({
      where: { id: courseId },
    });

    return course;
  }

  async getCourseLessonById(
    id: string
  ): Promise<undefined | GetCourseLessonById> {
    const courseLesson = await Course.findByPk(id, {
      include: [
        'badge',
        'category',
        {
          model: Lesson,
          as: 'lessons',
          include: ['category'],
          through: { attributes: ['position', 'id'] },
        },
        {
          model: CategoryCourse,
          // TODO rename this...
          as: 'categoryCourses',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'title'],
            },
          ],
          attributes: ['categoryId'],
        },
      ],
    });

    return courseLesson?.dataValues as GetCourseLessonById;
  }

  async updateCourseWithLessons(data: any) {
    const {
      id,
      is_learning_path,
      category_id,
      categoryIds,
      lessons,
      removedLessons,
      ...restProps
    } = data;

    const newCourse = {
      is_learning_path,
      category_id: !is_learning_path ? category_id : null,
      ...restProps,
    };

    const course = await Course.findByPk(id);
    if (!course) throw new ResourceNotFound('course');

    if (
      newCourse.status === 'published' &&
      this.user.auth.isAdmin &&
      this.user.tenant === course.tenant_id
    ) {
      newCourse.isPublic = true;
    }

    const payloads = categoryIds.map((categoryId: any) => {
      return {
        categoryId,
        courseId: id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    await Course.update(newCourse, { where: { id } });
    if (categoryIds && categoryIds.length) {
      await sequelize.transaction(async (transaction) => {
        const categoryCourse = CategoryCourseServiceFactory(this.user);

        const sequelizeOpts = this.getSequelizeOpts({ transaction });
        await Promise.all([
          categoryCourse.deleteByCourseId(id, sequelizeOpts),
          categoryCourse.bulkCreate(payloads, sequelizeOpts),
        ]);

        return;
      });
    }

    await CourseLesson.destroy({ where: { id: removedLessons } });

    const newCourseLesson = lessons.map((lesson: number, index: number) => ({
      lesson_id: lesson,
      course_id: id,
      position: index,
    }));

    await CourseLesson.bulkCreate(newCourseLesson, {
      updateOnDuplicate: ['lesson_id', 'course_id', 'position'],
    });
    const courseLesson = await this.getCourseLessonById(id);

    return courseLesson;
  }

  async updateCourse(id: string, data: any) {
    const course = await Course.findByPk(id);
    if (!course) throw new InvalidPayload('the course don´t exist');

    if (
      data.status === 'published' &&
      this.user.auth.isAdmin &&
      course.tenant_id === this.user.tenant
    ) {
      data.isPublic = true;
    }

    await Course.update(data, { where: { id } });
  }
}

export class AdminCourseService extends CourseService {
  getContextQuery() {
    return {};
  }
}
export class OwnerCourseService extends CourseService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export class UserCourseService extends CourseService {
  getContextQuery() {
    return {
      tenant_id: this.user.tenant,
    };
  }
}

export function CourseServiceFactory(user: AuthUser) {
  if (user?.auth?.isAdmin) {
    return new AdminCourseService(Course, user);
  } else if (user?.auth?.isOwner) {
    return new OwnerCourseService(Course, user);
  }
  return new UserCourseService(Course, user);
}
