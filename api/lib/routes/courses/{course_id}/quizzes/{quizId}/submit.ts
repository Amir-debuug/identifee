import { apiSchemas } from 'lib/generators';
import {
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'submitCourseQuiz',
  {
    operationId: 'submitCourseQuiz',
    summary: 'Submit Course Quiz',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.courseId, parameters.quizId],
    requestBody: generateRequestBody(apiSchemas.QuizCreateSubmissionBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.QuizSubmissionAttr),
      404: responses.notFound.generate('Course', 'Quiz'),
    },
  },
  async (req, res) => {
    const {
      body,
      params: { course_id, quizId },
    } = req;

    try {
      const submission = await req.services.biz.courseProgress.submitQuiz(
        // Submitting a quiz will always be in the context of self
        { self: true },
        course_id,
        quizId,
        body
      );

      await res.success(submission);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Course not found' });
      }
      throw error;
    }
  }
);
