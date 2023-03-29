import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  queries,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getDashboards',
  {
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    'x-verified': true,
    operationId: 'getDashboards',
    summary: 'Get Dashboards',
    tags: ['dashboards'],
    security: [{ Bearer: [] }],
    parameters: [
      ...queries.pagination,
      ...generateBulkQueryParam(apiSchemas.DashboardQueryBiz),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.DashboardAttr),
    },
  },
  async (req, res) => {
    const {
      query: { limit, organizationId, page, type },
    } = req;

    const dashboards = await req.services.biz.dashboard.get(
      undefined,
      { limit, page },
      { organizationId, type }
    );

    await res.success(dashboards);
  }
);

export const POST = operationMiddleware(
  'createDashboard',
  {
    'x-verified': true,
    operationId: 'createDashboard',
    summary: 'Create Dashboard',
    tags: ['dashboards'],
    security: [{ Bearer: [] }],
    parameters: [],
    requestBody: generateRequestBody(apiSchemas.DashboardCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.DashboardAttr),
    },
  },
  async (req, res) => {
    const { body } = req;

    const dashboard = await req.services.biz.dashboard.create(undefined, body);

    await res.success(dashboard);
  }
);
