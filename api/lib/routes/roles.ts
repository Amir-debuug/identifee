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

export const GET = operationMiddleware(
  'getRoles',
  {
    'x-verified': true,
    operationId: 'getRoles',
    summary: 'Get Roles',
    tags: ['roles'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.RoleQueryBiz),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.RoleAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      query: { page, limit, order, search, self },
    } = req;

    const roles = await req.services.biz.role.get(
      { self },
      { limit, page },
      { order, search }
    );

    await res.success(roles);
    return;
  }
);

export const POST = operationMiddleware(
  'createRole',
  {
    'x-verified': true,
    operationId: 'createRole',
    summary: 'Create Role',
    tags: ['roles'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.RoleCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.RoleAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { body } = req;

    const role = await req.services.biz.role.create(undefined, body);

    await res.success(role);
    return;
  }
);
