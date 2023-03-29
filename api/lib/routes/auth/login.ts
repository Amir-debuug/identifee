import {
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { AuthenticationService } from 'lib/services';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'login',
  {
    operationId: 'login',
    summary: 'Login',
    tags: ['auth'],
    security: [],
    requestBody: generateRequestBody({
      oneOf: [
        {
          type: 'object',
          required: ['grant_type', 'username', 'password'],
          properties: {
            grant_type: {
              type: 'string',
              enum: ['password'],
            },
            client_id: {
              type: 'string',
            },
            username: {
              type: 'string',
            },
            password: {
              type: 'string',
            },
            otp: {
              type: 'string',
            },
          },
        },
      ],
    }),
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: ['access_token', 'refresh_token', 'expires'],
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
        },
      }),
    },
  },

  async (req, res) => {
    const { body } = req;

    const authenticationService = new AuthenticationService();

    const ip = req.ip;
    const userAgent = req.get('user-agent');

    const { accessToken, refreshToken, expires } =
      await authenticationService.authenticate({
        ...body,
        ip,
        userAgent,
      });

    const payload = {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires,
    };

    await res.success(payload);
    return;
  }
);
