import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class ReportDAO extends DAO<'ReportDB'> {
  async findOneById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    const report = await this.repo.findOne({
      where: builder.build(),
    });

    return this.toJSON(report);
  }

  async deleteById(context: ContextQuery, id: string) {
    const builder = this.where();
    builder.merge({ id });
    builder.context(context);

    await this.repo.destroy({
      where: builder.build(),
    });
  }
}
