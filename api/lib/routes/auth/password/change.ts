import { apiSchemas } from 'lib/generators';
import {
  generateEmptyResponseSchema,
  generateRequestBody,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const PUT = operationMiddleware(
  'changePassword',

  {
    'x-verified': true,
    operationId: 'changePassword',
    summary: 'Change Password',
    tags: ['auth'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.UserCredentialChangePassword),
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('User'),
    },
  },

  async (req, res) => {
    const { body } = req;

    try {
      await req.services.biz.userCredential.changePassword(
        { self: true },
        req.user.id,
        body
      );

      return res.success({});
    } catch (error) {
      // shouldn't really happen..
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'User not found' });
      }
      throw error;
    }
  }
);
