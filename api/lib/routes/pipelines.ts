import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'createPipeline',
  {
    operationId: 'createPipeline',
    summary: 'Create Pipeline',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.PipelineCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.PipelineAttr),
    },
  },

  isAuthorizedMiddleware(permissions.deals.create) as any,
  async (req, res) => {
    const { body } = req;

    const pipeline = await req.services.biz.pipeline.create(undefined, body);

    await res.success(pipeline);
    return;
  }
);

export const GET = operationMiddleware(
  'getPipelines',
  {
    operationId: 'getPipelines',
    summary: 'Get Pipelines',
    tags: ['pipelines'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.PipelineQueryBiz),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.PipelineAttr),
    },
  },

  isAuthorizedMiddleware(permissions.deals.view) as any,
  async (req, res) => {
    const {
      query: { page, limit, order },
    } = req;

    const pipelines = await req.services.biz.pipeline.get(
      undefined,
      { limit, page },
      { order }
    );

    await res.success(pipelines);
    return;
  }
);
