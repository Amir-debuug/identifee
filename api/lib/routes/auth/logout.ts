import {
  generateEmptyResponseSchema,
  generateRequestBody,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'logout',

  {
    'x-verified': true,
    operationId: 'logout',
    summary: 'Logout',
    tags: ['auth'],
    security: [],
    requestBody: generateRequestBody({
      type: 'object',
      additionalProperties: false,
      required: ['refresh_token'],
      properties: {
        refresh_token: {
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
      body: { refresh_token },
    } = req;

    await req.services.dao.session.deleteByRefreshToken({}, refresh_token);

    await res.success({});
    return;
  }
);
