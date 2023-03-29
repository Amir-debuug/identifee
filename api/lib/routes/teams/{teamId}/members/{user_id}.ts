import {
  generateEmptyResponseSchema,
  generateErrorResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

// TODO remove this route
export const POST = operationMiddleware(
  'createTeamMember',
  {
    deprecated: true,
    description: 'Use bulk team member creation instead.',

    operationId: 'createTeamMember',
    summary: 'Create Team Member',
    tags: ['teams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.teamId, parameters.userId],
    requestBody: generateRequestBody(apiSchemas.TeamMemberCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.TeamMemberAttr),
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
      params: { teamId, user_id },
    } = req;

    try {
      const teamMember = await req.services.biz.teamMember.createByCompositeIds(
        undefined,
        teamId,
        user_id,
        body
      );

      await res.success(teamMember);
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

// TODO remove this route
export const DELETE = operationMiddleware(
  'deleteTeamMember',
  {
    deprecated: true,
    description: 'Use bulk team member creation instead.',

    operationId: 'deleteTeamMember',
    summary: 'Delete Team Member',
    tags: ['teams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.teamId, parameters.userId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Team'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { teamId, user_id },
    } = req;

    try {
      await req.services.biz.teamMember.deleteByCompositeIds(
        undefined,
        teamId,
        user_id
      );

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Team not found' });
      }
      throw error;
    }
  }
);
