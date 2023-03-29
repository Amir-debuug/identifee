import {
  generateEmptyResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const DELETE = operationMiddleware(
  'deleteArticle',
  {
    operationId: 'deleteArticle',
    summary: 'Delete TLDR Article',
    tags: ['news', 'articles'],
    security: [{ Bearer: [] }],
    parameters: [parameters.articleId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Article'),
    },
  },
  async (req, res) => {
    const {
      params: { articleId },
    } = req;
    try {
      await req.services.biz.article.deleteById(undefined, articleId);

      await res.success({});
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Article not found' });
      }
      throw error;
    }
  }
);
