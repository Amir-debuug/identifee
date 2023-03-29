import DAO from './utils/DAO';

export class DefaultFieldDAO extends DAO<'DefaultFieldDB'> {
  async getAll(type: string | undefined) {
    const builder = this.where();

    if (type) {
      builder.merge({ type });
    }

    const defaultFields = await this.repo.findAll({
      where: builder.build(),
    });

    return this.rowsToJSON(defaultFields);
  }
}
