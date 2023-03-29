import { apiSchemas } from 'lib/generators';
import {
  generateEmptyResponseSchema,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getCourseById',
  {
    'x-verified': true,
    operationId: 'getCourseById',
    summary: 'Get Course by Id',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.courseId],
    responses: {
      200: generateResponseSchema(apiSchemas.CourseAttr),
      404: responses.notFound.generate('Course'),
    },
  },
  async (req, res) => {
    const {
      params: { course_id },
    } = req;

    try {
      const course = await req.services.biz.course.getOneById(
        undefined,
        course_id
      );

      await res.success(course);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);

export const DELETE = operationMiddleware(
  'deleteCourseById',
  {
    'x-verified': true,
    operationId: 'deleteCourseById',
    summary: 'Delete Course by Id',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.courseId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Course'),
    },
  },
  async (req, res) => {
    const {
      params: { course_id },
    } = req;

    try {
      await req.services.biz.course.deleteById(undefined, course_id);

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);
