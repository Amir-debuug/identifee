import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  parameters,
  queries,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getCategoryCourses',
  {
    operationId: 'getCategoryCourses',
    summary: 'Get Category Courses',
    tags: ['categories', 'courses'],
    security: [{ Bearer: [] }],
    parameters: [
      ...queries.pagination,
      parameters.categoryId,
      ...generateBulkQueryParam(apiSchemas.GetCategoryCoursesQuery),
      queries.self,
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.CourseAttr),
    },
  },

  async (req, res) => {
    const {
      params: { categoryId },
      query: { favorites, limit, order, page, progress, self },
    } = req;

    const courses = await req.services.biz.category.getCoursesById(
      { self },
      categoryId,
      { limit, page },
      {
        favorites,
        order: order?.map((item) => JSON.parse(item as any)),
        progress,
      }
    );

    await res.success(courses);
    return;
  }
);
