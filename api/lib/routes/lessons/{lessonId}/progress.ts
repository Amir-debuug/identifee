import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getLessonProgress',
  {
    operationId: 'getLessonProgress',
    summary: 'Get Lesson Progress',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [
      parameters.lessonId,
      ...generateBulkQueryParam(apiSchemas.Self),
    ],
    responses: {
      200: generateResponseSchema(apiSchemas.LessonProgressAttr),
      404: responses.notFound.generate('LessonProgress'),
    },
  },
  async (req, res) => {
    const {
      query: { self },
      params: { lessonId },
    } = req;

    try {
      const progress = await req.services.biz.lessonProgress.getOneByLessonId(
        { self },
        lessonId
      );

      await res.success(progress);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'LessonProgress not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'continueLesson',
  {
    operationId: 'continueLesson',
    summary: 'Continue Lesson',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId],
    requestBody: generateRequestBody(apiSchemas.LessonProgressUpsertBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.LessonProgressAttr),
      404: responses.notFound.generate('Lesson', 'LessonPage'),
    },
  },
  async (req, res) => {
    const {
      body,
      params: { lessonId },
    } = req;

    try {
      const progress = await req.services.biz.lessonProgress.continue(
        // Continuing a lesson will always be in the context of self
        { self: true },
        lessonId,
        body
      );

      await res.success(progress);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);
