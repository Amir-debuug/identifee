import { apiSchemas } from 'lib/generators';
import {
  generateArrayResponseSchema,
  generateBulkQueryParam,
  operationMiddleware,
  parameters,
  responses,
} from 'lib/middlewares/openapi';

export const GET = operationMiddleware(
  'getCourseLessonProgress',
  {
    operationId: 'getCourseLessonProgress',
    summary: 'Get Course Lesson Progress',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [
      parameters.courseId,
      ...generateBulkQueryParam(apiSchemas.Self),
      ...generateBulkQueryParam(apiSchemas.CourseQueryBiz),
    ],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.LessonProgressAttr),
      404: responses.notFound.generate('Course'),
    },
  },

  async (req, res) => {
    const {
      params: { course_id },
      query: { lessonId, self },
    } = req;

    try {
      const progresses = await req.services.biz.course.getLessonProgressById(
        { self },
        course_id,
        { lessonId }
      );

      await res.success(progresses);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);
