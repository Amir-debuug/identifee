import {
  LessonProgressCreateDAO,
  LessonProgressModifyDAO,
} from 'lib/middlewares/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class LessonProgressDAO extends DAO<'LessonProgressDB'> {
  async findLatestByLessonIds(context: ContextQuery, lessonIds: number[]) {
    const builder = this.where();
    builder.merge({ lesson_id: lessonIds });
    builder.context(context);

    const progressesIds = await this.repo.findAll({
      attributes: [
        [Sequelize.fn('max', Sequelize.literal('id')), 'id'],
        'lesson_id',
      ],
      group: ['lesson_id'],
      where: builder.build(),
    });

    const progressBuilder = this.where();
    progressBuilder.merge({ id: progressesIds.map((p) => p.id) });
    const progresses = await this.repo.findAll({
      where: progressBuilder.build(),
    });

    return this.rowsToJSON(progresses);
  }

  async findOneByLessonId(context: ContextQuery, lessonId: number) {
    const builder = this.where();
    builder.merge({ lesson_id: lessonId });
    builder.context(context);

    const progress = await this.repo.findOne({
      order: [['id', 'desc']],
      where: builder.build(),
    });

    return this.toJSON(progress);
  }

  async findOneInProgressByLessonId(context: ContextQuery, lessonId: number) {
    const builder = this.where();
    builder.merge({ lesson_id: lessonId });
    builder.or([{ status: 'in_progress' }, { status: 'pending' }]);
    builder.context(context);

    const progress = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(progress);
  }

  async create(context: ContextQuery, payload: LessonProgressCreateDAO) {
    const builder = this.where();
    builder.context(context);

    const progress = await this.repo.create(payload);

    return this.toJSON(progress)!;
  }

  async updateById(
    context: ContextQuery,
    id: number,
    payload: LessonProgressModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const [, [progress]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(progress);
  }
}
