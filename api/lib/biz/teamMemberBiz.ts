import { Pagination } from 'lib/dao';
import {
  MemberTeamCreateBiz,
  TeamMemberCreateBiz,
  TeamMemberUpsertBiz,
} from 'lib/middlewares/sequelize';
import { Transaction, TransactionOptions } from 'sequelize';
import { Biz, UserQuery } from './utils';

export class TeamMemberBiz extends Biz {
  async getByTeamId(
    override: UserQuery | undefined,
    teamId: string,
    pagination: Pagination
  ) {
    const context = await this.tenantQuery.build(override);

    // ensure team exists
    await this.services.biz.team.getOneById(override, teamId);

    return this.services.dao.teamMember.findByTeamId(
      context,
      teamId,
      pagination
    );
  }

  async getByUserId(override: UserQuery | undefined, memberId: string) {
    const context = await this.tenantQuery.build(override);

    // ensure user exists
    await this.services.biz.user.getOneById(override, memberId);

    return this.services.dao.teamMember.findByUserId(context, memberId);
  }

  async createByCompositeIds(
    override: UserQuery | undefined,
    teamId: string,
    userId: string,
    payload: TeamMemberCreateBiz,
    opts: TransactionOptions = {}
  ) {
    const context = await this.tenantQuery.build(override);

    await this.services.biz.team.getOneById(override, teamId);

    if (payload.isManager) {
      const {
        data: [manager],
      } = await this.services.dao.teamMember.findByTeamId(
        context,
        teamId,
        { page: 1, limit: 1 },
        { isManager: true }
      );
      if (manager && manager.userId !== userId) {
        throw new this.exception.Conflict('maximum of one manager is allowed');
      }
    }

    const teamMember = await this.services.dao.teamMember.create(
      context,
      { ...payload, teamId, userId },
      opts
    );
    return teamMember;
  }

  async bulkSetByTeamId(
    override: UserQuery | undefined,
    teamId: string,
    payload: TeamMemberUpsertBiz[],
    opts: TransactionOptions = {}
  ) {
    const context = await this.tenantQuery.build(override);

    await this.services.biz.team.getOneById(override, teamId, opts);

    const totalMangers = payload.filter(({ isManager }) => isManager);
    if (totalMangers.length > 1) {
      throw new this.exception.Conflict('maximum of one manager is allowed');
    }

    const manager = totalMangers[0];
    const managerInUser = payload.filter(
      ({ userId }) => userId === manager.userId
    );
    if (managerInUser) {
      throw new this.exception.Conflict('user already selected as manager');
    }

    return this.services.dao.teamMember.transaction(
      {
        ...opts,
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
      },
      async (transaction) => {
        await this.services.dao.teamMember.deleteByTeamId(context, teamId, {
          transaction,
        });
        const teamMembers = await this.services.dao.teamMember.bulkUpsert(
          context,
          payload.map((member) => ({ ...member, teamId })),
          opts
        );
        return teamMembers;
      }
    );
  }

  async bulkUpsert(
    override: UserQuery | undefined,
    payloads: MemberTeamCreateBiz[]
  ) {
    const context = await this.tenantQuery.build(override);

    const payloadTeamMember = payloads.map((payload) => {
      return {
        userId: this.user.id,
        ...payload,
      };
    });

    return this.services.dao.teamMember.bulkUpsert(context, payloadTeamMember);
  }

  async deleteByCompositeIds(
    override: UserQuery | undefined,
    teamId: string,
    userId: string,
    opts: TransactionOptions = {}
  ) {
    const context = await this.tenantQuery.build(override);

    await this.services.biz.team.getOneById(override, teamId);

    await this.services.dao.teamMember.deleteByCompositeIds(
      context,
      teamId,
      userId,
      opts
    );

    return;
  }
}
