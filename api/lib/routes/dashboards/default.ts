import { apiSchemas } from 'lib/generators';
import {
  generateArrayResponseSchema,
  generateRequestBody,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'createDefaultDashboards',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'createDefaultDashboards',
    summary: 'Create Default Dashboards',
    tags: ['dashboards'],
    security: [{ Bearer: [] }],
    parameters: [],
    requestBody: generateRequestBody(apiSchemas.DashboardDefaultBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.DashboardAttr),
    },
  },

  async (req, res) => {
    const { body } = req;

    try {
      const dashboards = await req.services.biz.dashboard.createDefault(
        undefined,
        body
      );

      await res.success(dashboards);
      return;
    } catch (error) {
      throw error;
    }
  }
);
