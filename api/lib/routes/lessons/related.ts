import { apiSchemas } from 'lib/generators';
import { generateArrayResponseSchema } from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getRelatedLessons',
  {
    operationId: 'getRelatedLessons',
    summary: 'Get Related Lessons',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.LessonAttr),
    },
  },
  async (req, res) => {
    try {
      const lessons =
        await req.services.biz.lesson.getRandomLessonsWithUniqueCategoryId(
          undefined
        );

      await res.success(lessons);
      return;
    } catch (error) {
      throw error;
    }
  }
);
