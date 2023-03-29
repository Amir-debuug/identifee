import { generateEmptyResponseSchema } from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getStatus',
  {
    'x-verified': true,
    operationId: 'getStatus',
    summary: 'Get Status',
    tags: ['Monitoring'],
    security: [],
    responses: {
      200: generateEmptyResponseSchema(),
    },
  },
  async (req, res) => {
    return res.success({});
  }
);
