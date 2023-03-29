import {
  generateBulkQueryParam,
  generateEmptyResponseSchema,
  generateErrorResponseSchema,
  generateJSONBase,
  generateResponseSchema,
  operationMiddleware,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getTenants',
  {
    'x-verified': true,
    operationId: 'getTenants',
    summary: 'Get Tenants',
    tags: ['tenants'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.TenantQueryBiz),
    ],
    responses: {
      200: generateResponseSchema(apiSchemas.TenantBizGet),
      404: responses.notFound.generate('Tenant'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { includeOwners, limit, page, search, order } = req.query;

    try {
      const tenants = await req.services.biz.tenant.get(
        undefined,
        { limit, page },
        { includeOwners, search, order }
      );

      await res.success(tenants);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Tenant not found' });
      }
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createTenant',
  {
    operationId: 'createTenant',
    summary: 'Create Tenant',
    tags: ['tenants'],
    security: [{ Bearer: [] }],
    requestBody: {
      required: true,
      ...generateJSONBase({
        allOf: [
          apiSchemas.TenantCreateBiz,
          {
            type: 'object',
            additionalProperties: true,
            required: ['owner'],
            properties: {
              owner: {
                type: 'object',
                required: ['email'],
                properties: {
                  first_name: {
                    type: 'string',
                  },
                  last_name: {
                    type: 'string',
                  },
                  email: {
                    type: 'string',
                  },
                },
              },
            },
          },
        ],
      }),
    },
    responses: {
      200: generateEmptyResponseSchema(),
      409: generateErrorResponseSchema({
        description: 'Conflict',
        errors: [{ title: 'Tenant already exist' }],
      }),
      400: generateErrorResponseSchema({
        description: 'Bad request',
        errors: [{ title: 'invalid payloads' }],
      }),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { owner, ...rest } = req.body;
    try {
      const tenant = await req.services.biz.tenant.createTenant(
        undefined,
        rest,
        owner
      );

      await res.success(tenant);
      return;
    } catch (error) {
      if (error instanceof req.exception.InvalidPayload) {
        return res.error(400, { error: 'invalid payloads' });
      }
      if (error instanceof req.exception.Conflict) {
        return res.error(error.status, { error: 'Tenant already exist' });
      }
      throw error;
    }
  }
);
