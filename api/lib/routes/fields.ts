import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const POST = operationMiddleware(
  'createField',
  {
    operationId: 'createField',
    summary: 'Create Field',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.FieldCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.FieldAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { body } = req;

    const field = await req.services.biz.field.create(undefined, body);

    await res.success(field);
    return;
  }
);

export const GET = operationMiddleware(
  'getFields',
  {
    'x-verified': true,
    operationId: 'getFields',
    summary: 'Get Fields',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.FieldQueryBiz),
      ...generateBulkQueryParam(apiSchemas.Pagination),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.FieldAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      query: { page, limit, type, preferred, usedField, order },
    } = req;

    const fields = await req.services.biz.field.get(
      undefined,
      { limit, page },
      { type, preferred, usedField, order }
    );

    await res.success(fields);
    return;
  }
);
