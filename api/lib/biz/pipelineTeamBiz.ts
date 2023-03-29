import { PipelineTeamCreateBiz } from 'lib/middlewares/sequelize';
import { Biz, UserQuery } from './utils';

export class PipelineTeamBiz extends Biz {
  async create(
    override: UserQuery | undefined,
    payloads: PipelineTeamCreateBiz[]
  ) {
    return this.services.dao.pipelineTeam.create(payloads);
  }

  async getOneById(override: UserQuery | undefined, pipelineId: string) {
    const context = await this.userQuery.build(override);

    const pipelineTeam = await this.services.dao.pipelineTeam.findOneById(
      context,
      pipelineId
    );
    if (!pipelineTeam) {
      throw new this.exception.ResourceNotFound('pipelineTeam');
    }
    return pipelineTeam;
  }

  async getOneByCompositeIds(
    override: UserQuery | undefined,
    pipelineId: string,
    teamId: string
  ) {
    const context = await this.userQuery.build(override);

    const pipelineTeam =
      await this.services.dao.pipelineTeam.findOneByCompositeIds(
        context,
        pipelineId,
        teamId
      );
    if (!pipelineTeam) {
      throw new this.exception.ResourceNotFound('pipelineTeam');
    }
    return pipelineTeam;
  }

  async getAllById(override: UserQuery | undefined, pipelineId: string) {
    const context = await this.userQuery.build(override);

    const pipelineTeams = await this.services.dao.team.findAllByPipelineId(
      context,
      pipelineId
    );
    return pipelineTeams;
  }

  async deleteByCompositeIds(
    override: UserQuery | undefined,
    pipelineId: string,
    teamId: string
  ) {
    await this.getOneById(override, pipelineId);

    const context = await this.userQuery.build(override);

    await this.services.dao.pipelineTeam.deleteById(
      context,
      pipelineId,
      teamId
    );

    return;
  }
}
