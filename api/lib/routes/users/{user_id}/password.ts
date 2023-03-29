import { apiSchemas } from 'lib/generators';
import {
  generateEmptyResponseSchema,
  generateRequestBody,
  operationMiddleware,
  parameters,
  responses,
} from 'lib/middlewares/openapi';

export const PUT = operationMiddleware(
  'changeUserPassword',

  {
    'x-verified': true,
    operationId: 'changeUserPassword',
    summary: 'Change User Password',
    tags: ['users'],
    security: [{ Bearer: [] }],
    parameters: [parameters.userId],
    requestBody: generateRequestBody(apiSchemas.UserCredentialResetPasswordBiz),
    responses: {
      200: generateEmptyResponseSchema(),
      400: responses.badRequest.generate('Password or generate required'),
      404: responses.notFound.generate('User'),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { user_id },
    } = req;

    try {
      await req.services.biz.userCredential.resetPasswordById(
        undefined,
        user_id,
        body
      );

      return res.success({});
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'User not found' });
      }
      throw error;
    }
  }
);
