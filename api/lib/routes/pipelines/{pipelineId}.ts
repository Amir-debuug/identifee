import {
  generateRequestBody,
  generateResponseSchema,
  parameters,
  queries,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getPipeline',
  {
    operationId: 'getPipeline',
    summary: 'Get Pipeline',
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
      const pipeline = await req.services.biz.pipeline.getOneById(
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

export const POST = operationMiddleware(
  'clonePipeline',
  {
    operationId: 'clonePipeline',
    summary: 'Clone Pipeline',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId],
    requestBody: generateRequestBody({}),
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
      const pipeline = await req.services.biz.pipeline.cloneById(
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

export const PUT = operationMiddleware(
  'updatePipeline',
  {
    operationId: 'updatePipeline',
    summary: 'Update Pipeline',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId],
    requestBody: generateRequestBody(apiSchemas.PipelineModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.PipelineAttr),
      404: responses.notFound.generate('Pipeline'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      body,
      params: { pipelineId },
    } = req;

    try {
      const pipeline = await req.services.biz.pipeline.updateById(
        undefined,
        pipelineId,
        body
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

export const DELETE = operationMiddleware(
  'deletePipeline',
  {
    operationId: 'deletePipeline',
    summary: 'Delete Pipeline',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    parameters: [parameters.pipelineId, queries.transferId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Pipeline'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { pipelineId },
      query: { transferId },
    } = req;

    try {
      await req.services.biz.pipeline.deleteById(
        undefined,
        pipelineId,
        transferId
      );

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Pipeline not found' });
      }

      throw error;
    }
  }
);
