import { apiSchemas } from 'lib/generators';
import {
  generateErrorResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getTenantById',
  {
    'x-verified': true,
    operationId: 'getTenantById',
    summary: 'Get Tenant by Id',
    tags: ['tenants'],
    security: [{ Bearer: [] }],
    parameters: [parameters.tenantId],
    responses: {
      200: generateResponseSchema(apiSchemas.TenantAttr),
      403: generateErrorResponseSchema({
        description: 'Forbidden',
        errors: [{ title: 'unable to view this tenant' }],
      }),
      404: responses.notFound.generate('Tenant'),
    },
  },

  async (req, res) => {
    const {
      params: { tenantId },
    } = req;

    try {
      const tenant = await req.services.biz.tenant.getOneById(
        undefined,
        tenantId
      );

      await res.success(tenant);
      return;
    } catch (error) {
      if (error instanceof req.exception.Forbidden) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateTenant',
  {
    'x-verified': true,
    operationId: 'updateTenant',
    summary: 'Update Tenant',
    tags: ['tenants'],
    security: [{ Bearer: [] }],
    parameters: [parameters.tenantId],
    requestBody: generateRequestBody(apiSchemas.TenantModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.TenantAttr),
      404: responses.notFound.generate('Tenant'),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { tenantId },
    } = req;

    try {
      const tenant = await req.services.biz.tenant.updateById(
        undefined,
        tenantId,
        body
      );

      await res.success(tenant);
      return;
    } catch (error) {
      if (error instanceof req.exception.Forbidden) {
        return res.status(error.status).json({ error: error.message });
      }
      throw error;
    }
  }
);
