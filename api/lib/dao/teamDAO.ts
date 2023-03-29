import {
  GetTeamsQuery,
  TeamCreateDAO,
  TeamModifyDAO,
} from 'lib/middlewares/sequelize';
import { TransactionOptions } from 'sequelize';
import { ContextQuery, Pagination } from './utils';
import DAO from './utils/DAO';

export class TeamDAO extends DAO<'TeamDB'> {
  async find(
    context: ContextQuery,
    pagination: Pagination,
    query: GetTeamsQuery
  ) {
    const { order = [['updatedAt', 'DESC']] } = query;

    const builder = this.where();
    builder.merge({ deletedAt: null });
    builder.context(context);

    const { count, rows } = await this.repo.findAndCountAll({
      order,
      where: builder.build(),
      ...this.getPaginationQuery(pagination),
    });

    return this.getPaginatedResponse(this.rowsToJSON(rows), count, pagination);
  }

  async findOneById(
    context: ContextQuery,
    id: string,
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deletedAt: null });
    builder.context(context);

    const team = await this.repo.findOne({
      where: builder.build(),
      ...opts,
    });

    return this.toJSON(team);
  }

  async create(
    context: ContextQuery,
    payload: TeamCreateDAO,
    opts: TransactionOptions = {}
  ) {
    const team = await this.repo.create(payload, opts);

    return this.toJSON(team)!;
  }

  async updateById(context: ContextQuery, id: string, payload: TeamModifyDAO) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deletedAt: null });
    builder.context(context);

    const [, [team]] = await this.repo.update(payload, {
      returning: true,
      where: builder.build(),
    });

    return this.toJSON(team);
  }

  async deleteById(
    context: ContextQuery,
    id: string,
    opts: TransactionOptions = {}
  ) {
    const builder = this.where();
    builder.merge({ id });
    builder.merge({ deletedAt: null });
    builder.context(context);

    return this.transaction(opts, async (transaction) => {
      await Promise.all([
        this.services.dao.teamMember.deleteByTeamId(context, id, {
          transaction,
        }),
        this.repo.update(
          { deletedAt: new Date() },
          {
            where: builder.build(),
            ...opts,
          }
        ),
      ]);
    });
  }

  async findAllByPipelineId(context: ContextQuery, pipelineId: string) {
    const builder = this.where();
    builder.context(context);

    const pipelineTeamBuilder = this.services.dao.pipelineTeam.where();
    pipelineTeamBuilder.merge({ pipelineId });
    pipelineTeamBuilder.context(context);

    const teams = await this.repo.findAll({
      where: builder.build(),
      include: [
        {
          association: 'pipelineTeams',
          where: pipelineTeamBuilder.build(),
          attributes: [],
        },
      ],
    });

    return this.services.dao.team.rowsToJSON(teams);
  }
}
