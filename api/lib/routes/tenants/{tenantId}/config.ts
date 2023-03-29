import {
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getTenantConfig',
  {
    operationId: 'getTenantConfig',
    summary: 'Get Tenant Config',
    tags: ['tenants'],
    security: [{ Bearer: [] }],
    parameters: [parameters.tenantId],
    responses: {
      200: generateResponseSchema(apiSchemas.TenantConfigAttr),
      404: responses.notFound.generate('Tenant', 'TenantConfig'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { tenantId },
    } = req;

    try {
      const tenantConfig = await req.services.biz.tenantConfig.getOneByTenantId(
        undefined,
        tenantId
      );

      await res.success(tenantConfig);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'TenantConfig not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'upsertTenantConfig',
  {
    operationId: 'upsertTenantConfig',
    summary: 'Upsert Tenant Config',
    tags: ['tenants'],
    security: [{ Bearer: [] }],
    parameters: [parameters.tenantId],
    requestBody: generateRequestBody(apiSchemas.TenantConfigModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.TenantConfigAttr),
      404: responses.notFound.generate('Tenant'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      body,
      params: { tenantId },
    } = req;

    try {
      const tenantConfig = await req.services.biz.tenantConfig.upsertByTenantId(
        undefined,
        tenantId,
        body
      );

      await res.success(tenantConfig);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Tenant not found' });
      }
      throw error;
    }
  }
);
