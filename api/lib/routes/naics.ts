import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  operationMiddleware,
} from 'lib/middlewares/openapi';

export const GET = operationMiddleware(
  'getNAICS',
  {
    'x-verified': true,
    operationId: 'getNAICS',
    summary: 'Get NAICS',
    tags: ['naics'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.NaicsQueryBiz),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.NaicsAttr),
    },
  },

  async (req, res) => {
    const { limit, page, search } = req.query;

    const data = await req.services.biz.naics.get({ limit, page }, { search });

    return res.success(data);
  }
);
