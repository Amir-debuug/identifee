import {
  CategoryAttr,
  LessonCreateDAO,
  LessonModifyDAO,
  LessonPageAttr,
  LessonPreferenceAttr,
  LessonProgressAttr,
  LessonQueryDAO,
  VideoAttr,
} from 'lib/middlewares/sequelize';
import { Op, Sequelize } from 'sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';
import Where, { WhereOptions } from './utils/Where';

export class LessonDAO extends DAO<'LessonDB'> {
  /**
   * Returns randomized lessons, each with a unique category id.
   */
  async findRandomLessonsWithUniqueCategoryId(
    context: ContextQuery<'LessonDB'>
  ) {
    const builder = this.where();
    builder.merge({
      category_id: {
        [Op.not]: null,
      },
      status: 'published',
    });
    builder.context(context);
    this.includePublicResults(builder, {
      category_id: {
        [Op.not]: null,
      },
    });

    // This raw query will randomize lesson list from unique categories
    const generator = (this.repo.sequelize?.getQueryInterface() as any)
      .queryGenerator;
    const rawLessonByCategory = generator
      .selectQuery('lessons', {
        attributes: [
          Sequelize.literal(
            `DISTINCT ON ("category_id") "${this.repo.tableName}"."category_id"`
          ),
        ].concat(
          Object.keys(this.repo.rawAttributes)
            .filter((key) => key !== 'category_id')
            .map((key) => Sequelize.literal(`"${key}"`)) as any
        ) as any,
        order: Sequelize.literal('category_id, RANDOM()'),
        where: builder.build(),
      })
      .slice(0, -1);

    const lessons = await this.repo.sequelize?.query(
      `
      SELECT *
      FROM (${rawLessonByCategory}) l
      ORDER BY RANDOM()
      LIMIT 3
    `,
      {
        model: this.repo,
        mapToModel: true,
      }
    );

    return this.rowsToJSON(lessons || []);
  }

  /**
   * This function is a bit overloaded and covers the following
   *
   * 1. Get all lessons
   * 2. Get all lessons created by self
   * 3. Only get all lessons that have been favorited by any user
   * 4. Only get all lessons that have been favorited by self
   */
  async find(
    context: ContextQuery<'LessonDB'>,
    pagination: Pagination,
    query: LessonQueryDAO
  ) {
    const {
      categoryId,
      favorites,
      order = [['updated_at', 'desc']],
      progress,
      search,
      status,
    } = query;
    let { include = [] } = query;

    const categoryBuilder = this.services.dao.category.where();
    const builder = this.where();

    builder.merge({
      status: 'published',
    });

    if (categoryId) {
      builder.merge({ category_id: categoryId });
    }

    if (search) {
      builder.iLike(search, 'title');
      // TODO this doesn't work as include does id=category.id AND title ilike..
      // TODO category object not included when iLike added. Also should add (or) between both iLike.
      // categoryBuilder.iLike(search, 'title');
    }
    if (status) {
      builder.merge({ status });
    }

    if (favorites) {
      const preferenceBuilder = this.services.dao.lessonPreference.where();
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

      const progressBuilder = this.services.dao.lessonProgress.where();
      progressBuilder.context(context.progress || context);

      include.push({
        association: 'progress',
        required: progress === 'required',
        where: progressBuilder.build(),
      });
    }

    this.includePublicResults(builder);
    builder.context(context);

    include.push({
      association: 'category',
      required: false,
      where: categoryBuilder.build(),
    });

    if (query.contactAccessible) {
      const pageBuilder = this.services.dao.lessonPage.where();
      include.push({
        association: 'pages',
        where: pageBuilder.build({
          videoId: { [Op.ne]: null },
          contactAccessible: true,
        }),
        include: [
          {
            association: 'video',
            required: false,
          },
        ],
      });
    }

    const { count, rows } = await this.repo.findAndCountAll({
      distinct: !!favorites || !!progress,
      include,
      order: this.buildOrder(order),
      // this is required for child ordering to work...
      subQuery: false,
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON<{
        category?: CategoryAttr;
        preference?: LessonPreferenceAttr[];
        progress?: LessonProgressAttr[];
      }>(rows),
      count,
      pagination
    );
  }

  async findByCategoryId(
    context: ContextQuery<'LessonDB'>,
    categoryId: number,
    pagination: Pagination,
    query: LessonQueryDAO
  ) {
    const progressBuilder = this.services.dao.lessonProgress.where();
    progressBuilder.context(context.progress || context);

    return this.find(context, pagination, {
      ...query,
      categoryId,
      include: [
        {
          association: 'progress',
          required: false,
          where: progressBuilder.build(),
        },
      ],
    });
  }

  async findOneById(context: ContextQuery<'LessonDB'>, id: number) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);
    this.includePublicResults(builder);

    const lesson = await this.repo.findOne({
      include: [
        'category',
        {
          association: 'pages',
          include: [
            {
              association: 'video',
              required: false,
            },
          ],
        },
      ],
      order: [['pages', 'order', 'asc']],
      where: builder.build(),
    });

    return this.toJSON<{
      pages: (LessonPageAttr & { video?: VideoAttr })[];
      category: CategoryAttr;
    }>(lesson);
  }

  async create(context: ContextQuery, payload: LessonCreateDAO) {
    const lesson = await this.repo.create(payload);

    return this.toJSON(lesson)!;
  }

  async updateById(
    context: ContextQuery,
    id: number,
    payload: LessonModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [lesson]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(lesson);
  }

  async deleteById(context: ContextQuery, id: number) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [lesson]] = await this.repo.update(
      { status: 'deleted' },
      {
        returning: true,
        where: builder.build(),
      }
    );

    return this.toJSON(lesson);
  }

  public includePublicResults(
    builder: Where<'LessonDB'>,
    query: WhereOptions<'LessonDB'> = {}
  ) {
    const publicQuery = {
      ...query,
      isPublic: true,
      status: 'published',
    };

    builder.publicWhere(publicQuery);
  }
}
