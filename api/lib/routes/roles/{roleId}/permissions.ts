import { apiSchemas } from 'lib/generators';
import {
  generateArrayRequestBody,
  generateArrayResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getRolePermissions',
  {
    operationId: 'getRolePermissions',
    summary: 'Get Role Permissions',
    tags: ['roles'],
    security: [{ Bearer: [] }],
    parameters: [parameters.roleId],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.PermissionAttr),
      404: responses.notFound.generate('Role'),
    },
  },

  async (req, res) => {
    const {
      params: { roleId },
    } = req;

    try {
      const permissions = await req.services.biz.permission.getAllByRoleId(
        undefined,
        roleId
      );

      await res.success(permissions);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Role not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateRolePermissions',
  {
    operationId: 'updateRolePermissions',
    summary: 'Update Role Permissions',
    description:
      'This is a declarative route.\n' +
      'It will replace all permissions of the role with the ones provided.',
    tags: ['roles'],
    security: [{ Bearer: [] }],
    parameters: [parameters.roleId],
    requestBody: generateArrayRequestBody(apiSchemas.PermissionUpsertBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.PermissionAttr),
      404: responses.notFound.generate('Role'),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { roleId },
    } = req;

    try {
      const permissions = await req.services.biz.permission.bulkSetByRoleId(
        undefined,
        roleId,
        body
      );

      await res.success(permissions);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Role not found' });
      }
      throw error;
    }
  }
);
