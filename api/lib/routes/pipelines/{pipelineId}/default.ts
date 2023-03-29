import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const PUT = operationMiddleware(
  'setDefaultPipeline',
  {
    operationId: 'setDefaultPipeline',
    summary: 'Set Default Pipeline',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId],
    responses: {
      200: generateResponseSchema(apiSchemas.PipelineAttr),
      404: responses.notFound.generate('Pipeline'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { pipelineId },
    } = req;

    try {
      const pipeline = await req.services.biz.pipeline.setIsDefault(
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
