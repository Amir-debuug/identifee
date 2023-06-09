import { Pagination } from 'lib/dao';
import { TeamCreateBiz, TeamModifyBiz } from 'lib/middlewares/sequelize';
import { Transaction, TransactionOptions } from 'sequelize';
import { Biz, UserQuery } from './utils';

export class TeamBiz extends Biz {
  async get(override: UserQuery | undefined, pagination: Pagination) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.team.find(context, pagination, {});
  }

  async getOneById(
    override: UserQuery | undefined,
    id: string,
    opts: TransactionOptions = {}
  ) {
    const context = await this.tenantQuery.build(override);

    const team = await this.services.dao.team.findOneById(context, id, opts);
    if (!team) {
      throw new this.exception.ResourceNotFound('team');
    }
    return team;
  }

  async create(
    override: UserQuery | undefined,
    payload: TeamCreateBiz,
    opts: TransactionOptions = {}
  ) {
    const context = await this.tenantQuery.build(override);

    return this.services.dao.team.transaction(
      {
        ...opts,
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        const { members, ...rest } = payload;

        const team = await this.services.dao.team.create(
          context,
          { ...rest, tenantId: context.tenantId },
          { transaction }
        );
        const teamMembers = await this.services.biz.teamMember.bulkSetByTeamId(
          override,
          team.id,
          members,
          { transaction }
        );

        return {
          ...team,
          members: teamMembers,
        };
      }
    );
  }

  async updateById(
    override: UserQuery | undefined,
    id: string,
    payload: TeamModifyBiz
  ) {
    const context = await this.tenantQuery.build(override);

    const team = await this.services.dao.team.updateById(context, id, payload);
    if (!team) {
      throw new this.exception.ResourceNotFound('team');
    }
    return team;
  }

  async deleteById(override: UserQuery | undefined, id: string) {
    const context = await this.tenantQuery.build(override);

    await this.getOneById(override, id);

    return this.services.dao.team.deleteById(context, id);
  }
}
