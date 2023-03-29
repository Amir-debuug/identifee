import { apiSchemas } from 'lib/generators';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const PUT = operationMiddleware(
  'toggleFavoriteCourse',
  {
    'x-verified': true,
    operationId: 'toggleFavoriteCourse',
    summary: 'Toggle Favorite Course',
    description:
      'Toggles a course from favorite to not favorite and vice versa',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.courseId],
    responses: {
      200: generateResponseSchema(apiSchemas.CoursePreferenceAttr),
      404: responses.notFound.generate('Course'),
    },
  },
  async (req, res) => {
    const {
      params: { course_id },
    } = req;

    try {
      const preference = await req.services.biz.coursePreference.toggleFavorite(
        undefined,
        course_id
      );

      await res.success(preference);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);
