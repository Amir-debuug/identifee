import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getPipelineTeam',
  {
    operationId: 'getPipelineTeam',
    summary: 'Get Pipeline Teams',
    tags: ['pipelineTeams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.TeamAttr),
      404: responses.notFound.generate('PipelineTeam'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { pipelineId },
    } = req;

    try {
      const pipelineTeams = await req.services.biz.pipelineTeam.getAllById(
        undefined,
        pipelineId
      );
      await res.success(pipelineTeams);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'PipelineTeam not found' });
      }
      throw error;
    }
  }
);
