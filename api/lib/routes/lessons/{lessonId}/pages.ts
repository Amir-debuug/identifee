import { apiSchemas } from 'lib/generators';
import {
  generateArrayResponseSchema,
  generateRequestBody,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const PUT = operationMiddleware(
  'upsertLessonPages',
  {
    operationId: 'upsertLessonPages',
    summary: 'Upsert Lesson Pages',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId],
    requestBody: generateRequestBody(apiSchemas.LessonUpsertBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.LessonPageAttr),
      404: responses.notFound.generate('Lesson'),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { lessonId },
    } = req;

    try {
      const pages = await req.services.biz.lessonPage.upsertByLessonId(
        undefined,
        lessonId,
        body
      );

      await res.success(pages);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);
