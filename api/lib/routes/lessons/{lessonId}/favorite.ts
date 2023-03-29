import { apiSchemas } from 'lib/generators';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const PUT = operationMiddleware(
  'toggleFavoriteLesson',
  {
    'x-verified': true,
    operationId: 'toggleFavoriteLesson',
    summary: 'Toggle Favorite Lesson',
    description:
      'Toggles a lesson from favorite to not favorite and vice versa',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId],
    responses: {
      200: generateResponseSchema(apiSchemas.LessonPreferenceAttr),
      404: responses.notFound.generate('Lesson'),
    },
  },
  async (req, res) => {
    const {
      params: { lessonId },
    } = req;

    try {
      const preference = await req.services.biz.lessonPreference.toggleFavorite(
        undefined,
        lessonId
      );

      await res.success(preference);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);
