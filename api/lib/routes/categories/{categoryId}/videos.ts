import { apiSchemas } from 'lib/generators';
import {
  generatePaginatedResponseSchema,
  parameters,
  queries,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getCategoryVideos',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getCategoryVideos',
    summary: 'Get Category Videos',
    tags: ['categories'],
    security: [{ Bearer: [] }],
    parameters: [...queries.pagination, parameters.categoryId],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.VideoAttr),
      404: responses.notFound.generate('Category'),
    },
  },

  async (req, res) => {
    const {
      query: { ...pagination },
      params: { categoryId },
    } = req;

    try {
      const videos = await req.services.biz.category.getVideosById(
        undefined,
        categoryId,
        pagination
      );

      await res.success(videos);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Category not found' });
      }
      throw error;
    }
  }
);
