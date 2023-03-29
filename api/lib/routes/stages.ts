import {
  generateArrayRequestBody,
  generateArrayResponseSchema,
  // parameters,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getStages',
  {
    operationId: 'getStages',
    summary: 'Get Stages',
    tags: ['stages'],
    security: [{ Bearer: [] }],
    parameters: [],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.TenantDealStageAttrs),
    },
  },

  isAuthorizedMiddleware(permissions.deals.view) as any,
  async (req, res) => {
    const { pipelineId } = req.query;
    const stages = await req.services.biz.tenantDealStage.getAllByPipelineId(
      undefined,
      pipelineId
    );

    await res.success(stages);
    return;
  }
);

export const POST = operationMiddleware(
  'createStages',
  {
    operationId: 'createStages',
    summary: 'Create Stages',
    tags: ['stages'],
    security: [{ Bearer: [] }],
    requestBody: generateArrayRequestBody(apiSchemas.TenantDealStageCreateBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.TenantDealStageAttr),
    },
  },

  isAuthorizedMiddleware(permissions.deals.create) as any,
  async (req, res) => {
    const { body } = req;

    const stages = await req.services.biz.tenantDealStage.bulkCreate(
      undefined,
      body
    );

    await res.success(stages);
    return;
  }
);
