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
  'getFieldById',
  {
    operationId: 'getFieldById',
    summary: 'Get Field By Id',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    parameters: [parameters.fieldId],
    responses: {
      200: generateResponseSchema(apiSchemas.FieldAttr),
      404: responses.notFound.generate('Field'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { field_id },
    } = req;

    try {
      const field = await req.services.biz.field.getOneById(
        undefined,
        field_id
      );

      await res.success(field);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Field not found' });
      }
      throw error;
    }
  }
);

export const DELETE = operationMiddleware(
  'deleteField',
  {
    operationId: 'deleteField',
    summary: 'Delete Field',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    parameters: [parameters.fieldId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Field'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { field_id },
    } = req;

    try {
      await req.services.biz.field.deleteById(undefined, field_id);

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Field not found' });
      }

      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateField',
  {
    operationId: 'updateField',
    summary: 'Update Field',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    parameters: [parameters.fieldId],
    requestBody: generateRequestBody(apiSchemas.FieldModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.FieldAttr),
      404: responses.notFound.generate('Field'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      body,
      params: { field_id },
    } = req;

    try {
      const field = await req.services.biz.field.updateById(
        undefined,
        field_id,
        body
      );

      await res.success(field);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Field not found' });
      }

      throw error;
    }
  }
);
