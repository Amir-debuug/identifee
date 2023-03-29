import { apiSchemas } from 'lib/generators';
import { generateResponseSchema } from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getAuthContextTenant',
  {
    'x-verified': true,
    operationId: 'getAuthContextTenant',
    summary: 'Get Context Tenant',
    tags: ['Profile Management'],
    security: [{ Bearer: [] }],
    parameters: [],
    responses: {
      200: generateResponseSchema(apiSchemas.TenantAttr),
    },
  },

  async (req, res) => {
    const {
      user: { tenant: tenantId },
    } = req;

    const tenant = await req.services.biz.tenant.getOneById(
      undefined,
      tenantId
    );

    await res.success(tenant);
    return;
  }
);
