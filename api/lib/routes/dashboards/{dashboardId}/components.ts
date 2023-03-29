import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generateErrorResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  queries,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getDashboardComponents',
  {
    'x-authz': {
      allowedScopes: ['guest', 'profile', 'impersonation'],
    },
    operationId: 'getDashboardComponents',
    summary: 'Get Dashboard Components',
    tags: ['dashboards', 'components'],
    security: [{ Bearer: [] }],
    parameters: [
      parameters.dashboardId,
      ...queries.pagination,
      ...generateBulkQueryParam(apiSchemas.ComponentTextQueryBiz),
      ...generateBulkQueryParam(apiSchemas.ComponentQueryBiz),
    ],
    responses: {
      200: generateResponseSchema(apiSchemas.DashboardBizGetComponentsById),
      404: responses.notFound.generate('Dashboard'),
    },
  },

  async (req, res) => {
    const {
      params: { dashboardId },
      query: { page, limit, ...query },
    } = req;

    try {
      const components = await req.services.biz.dashboard.getComponentsById(
        undefined,
        dashboardId,
        { limit, page },
        query
      );

      await res.success(components);
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Dashboard not found' });
      }
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createDashboardComponent',
  {
    operationId: 'createDashboardComponent',
    summary: 'Create Dashboard Component',
    description:
      'Component must be created using at least with one analytic or componentText',
    tags: ['components', 'dashboards'],
    security: [{ Bearer: [] }],
    parameters: [parameters.dashboardId],
    requestBody: generateRequestBody(apiSchemas.DashboardAddComponentBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.ComponentAttr),
      400: generateErrorResponseSchema({
        description: 'Bad request',
        errors: [{ title: 'analytic or componentText required' }],
      }),
      404: responses.notFound.generate('Dashboard'),
    },
  },
  async (req, res) => {
    const {
      params: { dashboardId },
      body,
    } = req;

    try {
      const component = await req.services.biz.dashboard.addComponent(
        undefined,
        dashboardId,
        body
      );

      await res.success(component);
    } catch (error) {
      if (error instanceof req.exception.InvalidPayload) {
        return res.error(400, { error: error.message as any });
      }
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Dashboard not found' });
      }
      throw error;
    }
  }
);
