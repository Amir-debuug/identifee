import { apiSchemas } from 'lib/generators';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getOrganizationInights',
  {
    'x-authz': {
      allowedScopes: ['guest', 'profile', 'impersonation'],
    },
    operationId: 'getOrganizationInights',
    summary: 'Get Organization Insights',
    tags: ['organizations'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId],
    responses: {
      200: generateResponseSchema(apiSchemas.OrganizationBizGetInsights),
      404: responses.notFound.generate('Organization'),
    },
  },

  async (req, res) => {
    const {
      params: { organization_id },
    } = req;

    try {
      const insights = await req.services.biz.organization.getInsights(
        undefined,
        organization_id
      );

      await res.success(insights);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Organization not found' });
      }
      throw error;
    }
  }
);
