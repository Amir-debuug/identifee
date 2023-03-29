import {
  LessonPageCreateDAO,
  LessonPageModifyDAO,
} from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class LessonPageDAO extends DAO<'LessonPageDB'> {
  async findAllByLessonId(context: ContextQuery, lessonId: number) {
    const builder = this.where();
    builder.merge({ lesson_id: lessonId });
    // builder.context(context); // lesson can be public

    const pages = await this.repo.findAll({
      where: builder.build(),
    });

    return this.rowsToJSON(pages);
  }

  async findOneByIdAndLessonId(
    context: ContextQuery,
    id: number,
    lessonId: number
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ lesson_id: lessonId });
    // builder.context(context); // lessons can be public

    const page = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(page);
  }

  async create(context: ContextQuery, payload: LessonPageCreateDAO) {
    const page = await this.repo.create(payload);

    return this.toJSON(page)!;
  }

  async updateById(
    context: ContextQuery,
    id: number,
    payload: LessonPageModifyDAO
  ) {
    const builder = this.where();
    builder.merge({ id });
    // builder.context(context); // lessons can be public

    const [, [page]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(page);
  }

  async deleteById(context: ContextQuery, id: number | number[]) {
    const builder = this.where();
    builder.merge({ id });
    // builder.context(context); // lessons can be public

    return this.repo.destroy({
      where: builder.build(),
    });
  }
}
