import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getLessons',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getLessons',
    summary: 'Get Lessons',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.GetLessonsQuery),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.LessonAttr),
    },
  },
  async (req, res) => {
    const {
      query: { limit, page, order, self, ...rest },
    } = req;

    const lessons = await req.services.biz.lesson.get(
      { self },
      { limit, page },
      {
        order: order?.map((item) => JSON.parse(item as any)),
        ...rest,
      }
    );

    await res.success(lessons);
  }
);

export const POST = operationMiddleware(
  'createLesson',
  {
    'x-verified': true,
    operationId: 'createLesson',
    summary: 'Create Lesson',
    tags: ['Training'],
    requestBody: generateRequestBody(apiSchemas.LessonCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.LessonAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { body } = req;

    try {
      const lesson = await req.services.biz.lesson.create(undefined, body);

      await res.success(lesson);
      return;
    } catch (error) {
      throw error;
    }
  }
);
