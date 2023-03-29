import { CategoryCourseCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class CategoryCourseDAO extends DAO<'CategoryCourseDB'> {
  async bulkCreate(context: ContextQuery, payload: CategoryCourseCreateDAO[]) {
    const builder = this.where();
    builder.context(context);

    await this.repo.bulkCreate(payload);

    return;
  }
}
