import {
  generateBulkQueryParam,
  generateErrorResponseSchema,
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getTeams',
  {
    'x-verified': true,
    operationId: 'getTeams',
    summary: 'Get Teams',
    tags: ['teams'],
    security: [{ Bearer: [] }],
    parameters: [...generateBulkQueryParam(apiSchemas.Pagination)],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.TeamAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { query } = req;

    const teams = await req.services.biz.team.get(undefined, query);

    await res.success(teams);
    return;
  }
);

export const POST = operationMiddleware(
  'createTeam',
  {
    'x-verified': true,
    operationId: 'createTeam',
    summary: 'Create Team',
    tags: ['teams'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.TeamCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.TeamBizCreate),
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
    const { body } = req;

    try {
      const team = await req.services.biz.team.create(undefined, body);

      await res.success(team);
      return;
    } catch (error) {
      if (error instanceof req.exception.Conflict) {
        return res.error(error.status, { error: error.message as any });
      }
      throw error;
    }
  }
);
