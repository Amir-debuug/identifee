import { ContextQuery, Pagination } from 'lib/dao';
import {
  CourseCreateBiz,
  CourseQueryBiz,
  LessonAttr,
} from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class CourseBiz extends Biz {
  async getSelfContext(override: UserQuery | undefined, query: CourseQueryBiz) {
    const tenantContext = await this.userQuery.build({
      ...override,
      // if we're filtering child associations, don't restrict parent to self
      self: query.favorites || query.progress ? false : override?.self,
    });

    const context: ContextQuery<'CourseDB'> = tenantContext;

    if (query.favorites || query.progress) {
      const userContext = await this.userQuery.build(override);
      context.progress = userContext;
    }
    // favorites is either favorites for self or courses that have been favorited
    if (query.favorites) {
      const userContext = await this.userQuery.build(override);
      context.preference = userContext;
    }

    return context;
  }

  async getLessonProgressById(
    override: UserQuery | undefined,
    id: string,
    query: CourseQueryBiz = {}
  ) {
    const context = await this.userQuery.build(override);

    const course = await this.getOneById<{ lessons: LessonAttr[] }>(
      override,
      id,
      {
        lessons: 'required',
      }
    );

    let lessonIds = course.lessons.map((lesson) => lesson.id);
    if (query.lessonId) {
      lessonIds = lessonIds.filter((lessonId) =>
        Array.isArray(query.lessonId)
          ? query.lessonId.includes(lessonId)
          : lessonId === query.lessonId
      );
    }
    if (!lessonIds.length) {
      return [];
    }

    const lessonProgress =
      await this.services.biz.lessonProgress.getLatestByLessonIds(
        override,
        lessonIds
      );

    return lessonProgress;
  }

  async get(
    override: UserQuery | undefined,
    pagination: Pagination,
    query: CourseQueryBiz
  ) {
    const context = await this.getSelfContext(override, query);

    return this.services.dao.course.find(context, pagination, query);
  }

  async getOneById<T extends {} = {}>(
    override: UserQuery | undefined,
    courseId: string,
    query: CourseQueryBiz = {}
  ) {
    const context = await this.userQuery.build(override);

    const course = await this.services.dao.course.findOneById<T>(
      context,
      courseId,
      query
    );
    if (!course) {
      throw new this.exception.ResourceNotFound('course');
    }
    return course;
  }

  async create(override: UserQuery | undefined, payload: CourseCreateBiz) {
    const context = await this.tenantQuery.build(override);

    if (payload.status === 'published' && this.user.auth.isAdmin) {
      payload.isPublic = true;
    }
    if (!payload.status) {
      payload.status = 'draft';
    }

    const course = await this.services.dao.course.create(context, {
      ...payload,
      tenant_id: context.tenantId,
    });

    if (payload.categoryIds?.length) {
      const courseCategories = payload.categoryIds.map((categoryId) => {
        return { courseId: course.id, categoryId };
      });
      this.services.dao.categoryCourse.bulkCreate(context, courseCategories);
    }

    return course;
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    const context = await this.userQuery.build(override);

    const course = this.services.dao.course.deleteById(context, id);
    if (!course) {
      throw new this.exception.ResourceNotFound('Course');
    }

    return;
  }
}
