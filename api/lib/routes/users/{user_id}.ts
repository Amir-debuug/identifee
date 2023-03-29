import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateErrorResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getUser',
  {
    operationId: 'getUser',
    summary: 'Get User',
    tags: ['users'],
    security: [{ Bearer: [] }],
    parameters: [parameters.userId],
    responses: {
      200: generateResponseSchema(apiSchemas.UserAttr),
      404: responses.notFound.generate('User'),
    },
  },

  async (req, res) => {
    const {
      params: { user_id },
    } = req;

    try {
      const user = await req.services.biz.user.getOneById(
        undefined,
        ['me', 'self'].includes(user_id) ? req.user.id : user_id
      );

      await res.success(user);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'User not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateUser',
  {
    operationId: 'updateUser',
    summary: 'Update User',
    tags: ['users'],
    security: [{ Bearer: [] }],
    parameters: [parameters.userId],
    requestBody: generateRequestBody(apiSchemas.UserModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.UserAttr),
      404: responses.notFound.generate('User'),
      409: generateErrorResponseSchema({
        description: 'Conflict',
        errors: [
          { title: 'email already in use' },
          { title: "unable to change active user's email" },
        ],
      }),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { user_id },
      body,
    } = req;

    try {
      const user = await req.services.biz.user.updateById(
        undefined,
        ['me', 'self'].includes(user_id) ? req.user.id : user_id,
        body
      );

      await res.success(user);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'User not found' });
      }
      if (error instanceof req.exception.Conflict) {
        return res.error(error.status, { error: error.message as any });
      }
      throw error;
    }
  }
);
