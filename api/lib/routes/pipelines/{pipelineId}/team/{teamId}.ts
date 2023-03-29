import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const DELETE = operationMiddleware(
  'deletePipelineTeam',
  {
    operationId: 'deletePipelineTeam',
    summary: 'Delete Pipeline Team',
    tags: ['pipelineTeams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId, parameters.teamId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Pipeline Team'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { pipelineId, teamId },
    } = req;

    try {
      await req.services.biz.pipelineTeam.deleteByCompositeIds(
        undefined,
        pipelineId,
        teamId
      );

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Pipeline Team not found' });
      }

      throw error;
    }
  }
);
