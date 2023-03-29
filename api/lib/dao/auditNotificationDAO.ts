import {
  AuditAttr,
  AuditNotificationCreateDAO,
} from 'lib/middlewares/sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class AuditNotificationDAO extends DAO<'AuditNotificationDB'> {
  async find(context: ContextQuery, pagination: Pagination) {
    const builder = this.where();
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      include: [
        {
          association: 'audit',
        },
      ],
      order: [['createdAt', 'DESC']],
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(
      this.rowsToJSON<{
        audit: AuditAttr;
      }>(rows),
      count,
      pagination
    );
  }

  async create(
    context: ContextQuery,
    auditNotification: AuditNotificationCreateDAO
  ) {
    const resource = await this.repo.create(auditNotification);

    return this.toJSON(resource)!;
  }

  async bulkCreate(
    context: ContextQuery,
    auditNotifications: AuditNotificationCreateDAO[]
  ) {
    const resources = await this.repo.bulkCreate(auditNotifications, {
      returning: true,
    });

    return this.rowsToJSON(resources);
  }
}
