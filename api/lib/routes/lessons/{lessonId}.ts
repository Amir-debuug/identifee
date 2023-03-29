import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateEmptyResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getLessonById',

  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getLessonById',
    summary: 'Get Lesson by ID',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId],
    responses: {
      200: generateResponseSchema(apiSchemas.LessonBizGetOneById),
      404: responses.notFound.generate('Lesson'),
    },
  },

  async (req, res) => {
    const {
      params: { lessonId },
    } = req;

    try {
      const lesson = await req.services.biz.lesson.getOneById(
        undefined,
        lessonId
      );

      await res.success(lesson);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateLessonById',
  {
    'x-verified': true,
    operationId: 'updateLessonById',
    summary: 'Update Lesson by Id',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId],
    requestBody: generateRequestBody(apiSchemas.LessonModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.LessonAttr),
      404: responses.notFound.generate('Lesson'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      body,
      params: { lessonId },
    } = req;

    try {
      const lesson = await req.services.biz.lesson.updateById(
        undefined,
        lessonId,
        body
      );

      await res.success(lesson);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);

export const DELETE = operationMiddleware(
  'deleteLessonById',
  {
    'x-verified': true,
    operationId: 'deleteLessonById',
    summary: 'Delete Lesson by Id',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [parameters.lessonId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Lesson'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { lessonId },
    } = req;

    try {
      await req.services.biz.lesson.deleteById(undefined, lessonId);

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Lesson not found' });
      }
      throw error;
    }
  }
);
