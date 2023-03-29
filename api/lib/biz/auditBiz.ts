import { AuditCreateDAO } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class AuditBiz extends Biz {
  async create(override: UserQuery | undefined, payload: AuditCreateDAO) {
    const audit = await this.services.dao.audit.create({}, payload);

    await this.emitter.emitAppEvent(
      this.user,
      {
        event: 'AUDIT_CREATED',
        payload: {
          audit,
        },
      },
      this.otel
    );

    return audit;
  }
}
