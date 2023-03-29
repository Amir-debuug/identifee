import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getCourseContents',
  {
    operationId: 'getCourseContents',
    summary: 'Get Course Contents',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [
      parameters.courseId,
      ...generateBulkQueryParam(apiSchemas.Pagination),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.CourseContentAttr),
      404: responses.notFound.generate('Course'),
    },
  },
  async (req, res) => {
    const {
      query: { limit, page },
      params: { course_id },
    } = req;

    try {
      const contents = await req.services.biz.courseContent.getByCourseId(
        undefined,
        course_id,
        { page, limit }
      );

      await res.success(contents);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createCourseContent',
  {
    operationId: 'createCourseContent',
    summary: 'Create Course Content',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.courseId],
    requestBody: generateRequestBody(apiSchemas.CourseContentCreateQuizBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.CourseContentAttr),
      404: responses.notFound.generate('Course'),
    },
  },
  async (req, res) => {
    const {
      body,
      params: { course_id },
    } = req;

    try {
      const content = await req.services.biz.courseContent.createByCourseId(
        undefined,
        course_id,
        body
      );

      await res.success(content);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);
