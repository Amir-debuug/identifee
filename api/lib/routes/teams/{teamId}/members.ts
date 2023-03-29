import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayRequestBody,
  generateArrayResponseSchema,
  generateErrorResponseSchema,
  generateResponseSchema,
  operationMiddleware,
  parameters,
  queries,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';

export const GET = operationMiddleware(
  'getTeamMembers',
  {
    operationId: 'getTeamMembers',
    summary: 'Get Team Members',
    tags: ['teams'],
    security: [{ Bearer: [] }],
    parameters: [...queries.pagination, parameters.teamId],
    responses: {
      200: generateResponseSchema(apiSchemas.TeamMemberBizGetByTeamId),
      404: responses.notFound.generate('Team'),
    },
  },
  async (req, res) => {
    const {
      query,
      params: { teamId },
    } = req;

    try {
      const members = await req.services.biz.teamMember.getByTeamId(
        undefined,
        teamId,
        query
      );
      await res.success(members);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Team not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateTeamMembers',
  {
    operationId: 'updateTeamMembers',
    summary: 'Update Team Members',
    description:
      'This is a declarative route.\n' +
      'It will replace all members of the team with the ones provided.',
    tags: ['teams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.teamId],
    requestBody: generateArrayRequestBody(apiSchemas.TeamMemberUpsertBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.TeamMemberAttr),
      404: responses.notFound.generate('Team'),
      409: generateErrorResponseSchema({
        description: 'Conflict',
        errors: [
          {
            title: 'maximum of one manager is allowed',
          },
        ],
      }),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      body,
      params: { teamId },
    } = req;

    try {
      const teamMembers = await req.services.biz.teamMember.bulkSetByTeamId(
        undefined,
        teamId,
        body
      );

      await res.success(teamMembers);
      return;
    } catch (error) {
      if (error instanceof req.exception.Conflict) {
        return res.error(error.status, { error: error.message as any });
      }
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Team not found' });
      }
      throw error;
    }
  }
);
