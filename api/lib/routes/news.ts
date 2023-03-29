import {
  generateResponseSchema,
  operationMiddleware,
} from 'lib/middlewares/openapi';
import { newsFactory, NewsService } from 'lib/services/news';

const { NEWSOUTLET = 'newsapi' } = process.env;

export const GET = operationMiddleware(
  'getNews',
  {
    operationId: 'getNews',
    summary: 'Get News',
    tags: ['news'],
    security: [{ Bearer: [] }],
    parameters: [
      {
        in: 'query',
        name: 'name',
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: ['data'],
        properties: {},
      }),
    },
  },

  async (req, res) => {
    const outlet = NEWSOUTLET as NewsService;

    const newsService = newsFactory(outlet);

    const result = await newsService.getTopHeadlines(req.query);

    if (result.error) {
      return res.status(400).json();
    }

    res.success(result);
  }
);
