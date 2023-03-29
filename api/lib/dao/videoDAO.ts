import { VideoCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class VideoDAO extends DAO<'VideoDB'> {
  /**
   * This relationship feels SOOOOOO wrong. Eventually refactor into something
   * that makes sense, perhaps CategoryVideo table? As of now, we don't really
   * need videos to be associated to videos, only categories but this may change
   */
  async findByCategoryId(
    context: ContextQuery,
    categoryId: number,
    pagination: Pagination
  ) {
    const lessonWhere = this.services.dao.lesson.where();
    lessonWhere.merge({ category_id: categoryId });
    lessonWhere.context(context);
    this.services.dao.lesson.includePublicResults(lessonWhere);

    const videos = await this.repo.findAndCountAll({
      // forgive me for this wonky include...
      include: [
        {
          association: 'lessonPages',
          attributes: ['title'],
          include: [
            {
              association: 'lesson',
              attributes: [],
              where: lessonWhere.build(),
            },
          ],
          required: true,
          subQuery: false,
        },
      ],
      subQuery: false,
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON(videos.rows),
      videos.count,
      pagination
    );
  }

  async create(context: ContextQuery, payload: VideoCreateDAO) {
    const video = await this.repo.create(payload, { returning: true });

    return this.toJSON(video)!;
  }
}
