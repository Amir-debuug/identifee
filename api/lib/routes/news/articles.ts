import {
  generateResponseSchema,
  generateRequestBody,
  generateQueryParam,
  operationMiddleware,
  queries,
} from 'lib/middlewares/openapi';

import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getTLDRArticles',
  {
    operationId: 'getTLDRArticles',
    summary: 'Get Read Later Articles (RLA)',
    tags: ['news', 'articles', 'read later'],
    security: [{ Bearer: [] }],
    parameters: [
      ...queries.pagination,
      queries.search,
      generateQueryParam('order', false, {
        type: 'string',
      }),
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
    const {
      query: { page, limit },
    } = req;

    const articles = await req.services.biz.article.get(undefined, {
      limit,
      page,
    });

    res.success(articles);
  }
);

export const POST = operationMiddleware(
  'createTLDRArticle',
  {
    operationId: 'createTLDRArticle',
    summary: 'Create a read later article',
    tags: ['news', 'article', 'read later'],
    security: [{ Bearer: [] }],
    parameters: [],
    requestBody: generateRequestBody(apiSchemas.ArticleModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.ArticleAttr),
    },
  },
  async (req, res) => {
    const { body } = req;

    const badge = await req.services.biz.article.create(undefined, body);

    await res.success(badge);
  }
);
