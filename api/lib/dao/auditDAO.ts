import { AuditCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class AuditDAO extends DAO<'AuditDB'> {
  async find(context: ContextQuery, pagination: Pagination) {
    const builder = this.where();
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async create(context: ContextQuery, audit: AuditCreateDAO) {
    const createdAudit = await this.repo.create(audit);

    return this.toJSON(createdAudit)!;
  }
}
