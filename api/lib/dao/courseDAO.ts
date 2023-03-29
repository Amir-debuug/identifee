import {
  BadgeAttr,
  CategoryAttr,
  CourseContentAttr,
  CourseCreateDAO,
  CoursePreferenceAttr,
  CourseProgressAttr,
  CourseQueryDAO,
  CourseQueryBiz,
  QuizAttr,
} from 'lib/middlewares/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { Cast } from 'sequelize/types/lib/utils';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';
import Where, { WhereOptions } from './utils/Where';

export class CourseDAO extends DAO<'CourseDB'> {
  /**
   * This function is a bit overloaded and covers the following
   *
   * 1. Get all courses
   * 2. Get all courses created by self
   * 3. Only get all courses that have been favorited by any user
   * 4. Only get all courses that have been favorited by self
   */
  async find<T extends {} = { totalLessons: number }>(
    context: ContextQuery<'CourseDB'>,
    pagination: Pagination,
    query: CourseQueryDAO
  ) {
    const {
      categoryId,
      favorites,
      progress,
      search,
      status,
      totalLessons = true,
    } = query;

    let { include = ['badge', 'contents'], order = [['updated_at', 'desc']] } = query;

    const hasLessonsCountQuery = this.hasCustomOrderKey(order, 'totalLessons');
    order = this.transformCustomOrderKey(order, ['totalLessons']);

    const categoryCourseBuilder = this.services.dao.categoryCourse.where();
    const categoryBuilder = this.services.dao.category.where();
    const builder = this.where();

    builder.merge({ deleted: false, is_learning_path: false });

    categoryCourseBuilder.merge({ categoryId });

    if (search) {
      builder.iLike(search, 'name');
      categoryBuilder.iLike(search, 'title');
    }
    if (status) {
      builder.merge({ status });
    }

    if (favorites) {
      const preferenceBuilder = this.services.dao.coursePreference.where();
      preferenceBuilder.merge({ isFavorite: true });
      preferenceBuilder.context(context.preference || context);

      include.push({
        association: 'preferences',
        required: favorites === 'required',
        where: preferenceBuilder.build(),
      });
    }
    if (progress) {
      include = include.filter((table) => table !== 'progress');

      const progressBuilder = this.services.dao.courseProgress.where();
      progressBuilder.context(context.progress || context);

      include.push({
        association: 'progress',
        required: progress === 'required',
        where: progressBuilder.build(),
      });
    }

    if (categoryId) {
      // TODO should be directly to categories...
      include.push({
        association: 'categoryCourses',
        required: true,
        where: categoryCourseBuilder.build(),
      });
    }

    this.includePublicResults(builder);
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      attributes: {
        include:
          totalLessons || hasLessonsCountQuery ? [this.getLessonsCount()] : [],
      },
      distinct: !!favorites || !!progress,
      include,
      // this is required for child ordering to work...
      subQuery: false,
      order: this.buildOrder(order),
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON<
        T & {
          badge?: BadgeAttr;
          category?: CategoryAttr;
          preference?: CoursePreferenceAttr[];
          progress?: CourseProgressAttr[];
          quiz?: QuizAttr;
        }
      >(rows),
      count,
      pagination
    );
  }

  async findByCategoryId(
    context: ContextQuery<'CourseDB'>,
    categoryId: number,
    pagination: Pagination,
    query: CourseQueryDAO
  ) {
    return this.find<{}>(context, pagination, {
      ...query,
      categoryId,
      status: "eq 'published'",
      totalLessons: false,
    });
  }

  async findOneById<T extends {} = {}>(
    context: ContextQuery<'CourseDB'>,
    id: string,
    query: CourseQueryBiz = {}
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);
    this.includePublicResults(builder);

    const include = [
      {
        association: 'contents',
        required: false,
      },
    ];
    if (query.lessons) {
      include.push({
        association: 'lessons',
        required: query.lessons === 'required',
      });
    }

    const course = await this.repo.findOne({
      include,
      where: builder.build(),
    });

    return this.toJSON<T & { contents: CourseContentAttr[] }>(course);
  }

  async create(context: ContextQuery, payload: CourseCreateDAO) {
    const course = await this.repo.create(payload);

    return this.toJSON(course)!;
  }

  async deleteById(context: ContextQuery<'CourseDB'>, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deleted: false });
    builder.context(context);

    const [, [course]] = await this.repo.update(
      { deleted: true },
      {
        returning: true,
        where: builder.build(),
      }
    );

    return this.toJSON(course);
  }

  getLessonsCount() {
    return [
      // reaching the limit of Sequelize... must count with literal for 1:M..
      // without this raw query, sequelize improperly does a group by..
      Sequelize.cast(
        Sequelize.literal(`(
                SELECT COUNT(*) FROM "courses_lessons" cl WHERE "cl"."course_id" = "CourseDB"."id"
              )`),
        'integer'
      ),
      'totalLessons',
    ] as [Cast, string];
  }

  private includePublicResults(
    builder: Where<'CourseDB'>,
    query: WhereOptions<'CourseDB'> = {}
  ) {
    const publicQuery = {
      ...query,
      isPublic: true,
      status: 'published',
    };

    builder.publicWhere(publicQuery);
  }
}
