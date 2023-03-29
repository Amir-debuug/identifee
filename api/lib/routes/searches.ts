import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayResponseSchema,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'createSearch',
  {
    operationId: 'createSearch',
    summary: 'Create Search',
    tags: ['search'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.SearchCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.SearchAttr),
    },
  },

  isAuthorizedMiddleware(permissions.prospects.create) as any,
  async (req, res) => {
    const { body } = req;

    const resource = await req.services.biz.search.create(undefined, body);

    await res.success(resource);
    return;
  }
);

export const GET = operationMiddleware(
  'getSearches',
  {
    operationId: 'getSearches',
    summary: 'Get Searches',
    tags: ['Searches'],
    security: [{ Bearer: [] }],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.SearchAttr),
    },
  },

  isAuthorizedMiddleware(permissions.deals.view) as any,
  async (req, res) => {
    const resources = await req.services.biz.search.get(undefined);

    await res.success(resources);
    return;
  }
);
