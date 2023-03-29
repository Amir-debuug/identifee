import { apiSchemas } from 'lib/generators';
import { generateResponseSchema } from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getAuthContextUser',
  {
    'x-verified': true,
    operationId: 'getAuthContextUser',
    summary: 'Get Context User',
    tags: ['Profile Management'],
    security: [{ Bearer: [] }],
    parameters: [],
    responses: {
      200: generateResponseSchema(apiSchemas.UserAttr),
    },
  },

  async (req, res) => {
    const {
      user: { id },
    } = req;

    const user = await req.services.biz.user.getOneById(undefined, id);

    await res.success(user);
    return;
  }
);
