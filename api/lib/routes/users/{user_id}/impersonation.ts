import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { userServiceFactory } from 'lib/services';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'impersonation',
  {
    operationId: 'impersonation',
    summary: 'Impersonation',
    tags: ['auth'],
    security: [{ Bearer: [] }],
    parameters: [parameters.userId],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: ['access_token', 'refresh_token', 'expires', 'id'],
        properties: {
          access_token: {
            type: 'string',
          },
          refresh_token: {
            type: 'string',
          },
          expires: {
            type: 'number',
          },
          id: {
            type: 'string',
            format: 'uuid',
          },
        },
      }),
      404: responses.notFound.generate('User'),
    },
  },

  async (req, res) => {
    const {
      params: { user_id },
    } = req;

    try {
      const user = await req.services.biz.user.getOneById(undefined, user_id);

      const userService = userServiceFactory(req.user);
      const token = await userService.impersonate(user);

      await res.success(token);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'User not found' });
      }
      throw error;
    }
  }
);
