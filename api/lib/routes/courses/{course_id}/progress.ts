import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generateRequestBody,
  generateResponseSchema,
  operationMiddleware,
  parameters,
  responses,
} from 'lib/middlewares/openapi';

export const GET = operationMiddleware(
  'getCourseProgress',
  {
    operationId: 'getCourseProgress',
    summary: 'Get Course Progress',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [
      parameters.courseId,
      ...generateBulkQueryParam(apiSchemas.Self),
    ],
    responses: {
      200: generateResponseSchema(apiSchemas.CourseProgressAttr),
      404: responses.notFound.generate('CourseProgress'),
    },
  },

  async (req, res) => {
    const {
      query: { self },
      params: { course_id },
    } = req;

    try {
      const progress = await req.services.biz.courseProgress.getOneByCourseId(
        { self },
        course_id
      );

      await res.success(progress);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'CourseProgress not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'continueCourse',
  {
    operationId: 'continueCourse',
    summary: 'Continue Course',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.courseId],
    requestBody: generateRequestBody(apiSchemas.CourseProgressUpsertBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.CourseProgressAttr),
      404: responses.notFound.generate('Course'),
    },
  },
  async (req, res) => {
    const {
      body,
      params: { course_id },
    } = req;

    try {
      const progress = await req.services.biz.courseProgress.continue(
        // Continuing a course will always be in the context of self
        { self: true },
        course_id,
        body
      );

      await res.success(progress);
      return;
    } catch (error) {
      throw error;
    }
  }
);
