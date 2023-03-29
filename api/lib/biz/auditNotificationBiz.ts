import { Pagination } from 'lib/dao';
import { Biz, UserQuery } from './utils';

export class AuditNotificationBiz extends Biz {
  async get(override: UserQuery | undefined, pagination: Pagination) {
    const context = await this.userQuery.build(override);

    return this.services.dao.auditNotification.find(context, pagination);
  }
}
