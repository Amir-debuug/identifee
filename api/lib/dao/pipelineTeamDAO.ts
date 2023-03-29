import { PipelineTeamCreateDAO } from 'lib/middlewares/sequelize';
import { ContextQuery } from './utils';
import DAO from './utils/DAO';

export class PipelineTeamDAO extends DAO<'PipelineTeamDB'> {
  async create(payloads: PipelineTeamCreateDAO[]) {
    const pipelineTeams = await this.repo.bulkCreate(payloads, {
      updateOnDuplicate: ['teamId'],
    });

    return this.rowsToJSON(pipelineTeams)!;
  }

  async findOneById(context: ContextQuery, pipelineId: string) {
    const builder = this.where();
    builder.context(context);
    builder.merge({ pipelineId });

    const pipelineTeam = await this.repo.findOne({
      where: builder.build(),
      include: ['team'],
      attributes: [],
    });

    return this.toJSON(pipelineTeam);
  }

  async findOneByCompositeIds(
    context: ContextQuery,
    pipelineId: string,
    teamId: string
  ) {
    const builder = this.where();
    builder.context(context);
    builder.merge({ pipelineId });
    builder.merge({ teamId });

    const pipelineTeam = await this.repo.findOne({
      where: builder.build(),
      include: ['team'],
      attributes: [],
    });

    return this.toJSON(pipelineTeam);
  }

  async deleteById(context: ContextQuery, pipelineId: string, teamId?: string) {
    const builder = this.where();
    builder.context(context);

    builder.merge({ pipelineId });

    if (teamId) {
      builder.merge({ teamId });
    }

    await this.repo.destroy({
      where: builder.build(),
    });

    return;
  }
}
