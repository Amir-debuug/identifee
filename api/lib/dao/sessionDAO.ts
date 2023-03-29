import { SessionCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class SessionDAO extends DAO<'SessionDB'> {
  async create(context: ContextQuery, payload: SessionCreateDAO) {
    await this.repo.create(payload);
  }

  async deleteByRefreshToken(context: ContextQuery, refreshToken: string) {
    const builder = this.where();
    builder.merge({
      token: refreshToken,
    });

    await this.repo.destroy({ where: builder.build() });
  }

  async deleteAllExpired(context: ContextQuery) {
    const builder = this.where();
    builder.timeRange('expires', { end: new Date().toISOString() });

    await this.repo.destroy({ where: builder.build() });
  }
}
