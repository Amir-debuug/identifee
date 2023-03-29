import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getPipelineDealCount',
  {
    operationId: 'getPipelineDealCount',
    summary: 'Get Pipeline Deal Count',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        properties: {
          totalDeals: {
            type: 'number',
          },
        },
      }),
      404: responses.notFound.generate('Pipeline'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { pipelineId },
    } = req;

    try {
      const pipeline = await req.services.biz.pipeline.countDeals(
        undefined,
        pipelineId
      );
      await res.success(pipeline);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Pipeline not found' });
      }
      throw error;
    }
  }
);
