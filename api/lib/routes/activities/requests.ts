import { apiSchemas } from 'lib/generators';
import {
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  queries,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getActivityRequests',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getActivityRequests',
    summary: 'Get Activity Requests',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [...queries.pagination],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.ActivityRequestAttr),
    },
  },

  async (req, res) => {
    const {
      query: { limit, page },
    } = req;

    try {
      const activityRequests = await req.services.biz.activityRequest.get(
        undefined,
        { limit, page }
      );

      await res.success(activityRequests);
      return;
    } catch (error) {
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createActivityRequest',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'createActivityRequest',
    summary: 'Create Activity Request',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.ActivityRequestCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.ActivityRequestAttr),
    },
  },

  async (req, res) => {
    const { body } = req;

    try {
      const activityRequest = await req.services.biz.activityRequest.create(
        undefined,
        body
      );

      await res.success(activityRequest);
      return;
    } catch (error) {
      throw error;
    }
  }
);
