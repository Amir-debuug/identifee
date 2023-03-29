import {
  generateEmptyResponseSchema,
  generateRequestBody,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

/**
 * Deprecated route, look into renaming.
 */
export const POST = operationMiddleware(
  'checkPage',
  {
    deprecated: true,
    operationId: 'checkPage',
    summary: 'Check Page',
    description: 'To be deprecated',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId, parameters.pageId],
    requestBody: generateRequestBody({
      type: 'object',
      required: ['answer'],
      properties: {
        answer: {
          type: 'string',
        },
      },
    }),
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Lesson'),
    },
  },
  async (req, res) => {
    const {
      body,
      params: { lessonId, pageId },
    } = req;

    try {
      const isCorrect = await req.services.biz.lesson.submitQuiz(
        // Submitting a quiz will always be in the context of self
        { self: true },
        lessonId,
        pageId,
        body.answer
      );

      await res.success({ success: isCorrect });
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);
