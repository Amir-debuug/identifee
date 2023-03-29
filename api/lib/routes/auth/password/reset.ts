import {
  generateEmptyResponseSchema,
  generateRequestBody,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'resetPassword',
  {
    'x-verified': true,
    'x-authz': {
      requiredScope: 'password-reset',
    },
    operationId: 'resetPassword',
    summary: 'Reset Password',
    tags: ['auth'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody({
      type: 'object',
      additionalProperties: false,
      required: ['password'],
      properties: {
        password: {
          type: 'string',
        },
      },
    }),
    responses: {
      200: generateEmptyResponseSchema(),
    },
  },

  async (req, res) => {
    const {
      body: { password },
    } = req;

    try {
      await req.services.biz.userCredential.resetPasswordById(
        { self: true },
        req.user.id,
        { password }
      );

      return res.success({});
    } catch (error) {
      // this prevents bad actors from scanning for available accounts
      return res.success({});
    }
  }
);
