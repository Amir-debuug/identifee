import { apiSchemas } from 'lib/generators';
import {
  generateBulkQueryParam,
  generateRequestBody,
  generateResponseSchema,
  queries,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getCourses',
  {
    operationId: 'getCourses',
    summary: 'Get Courses',
    tags: ['Training'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.CourseQueryBiz),
      queries.self,
    ],
    responses: {
      200: generateResponseSchema(apiSchemas.CourseBizGet),
    },
  },
  async (req, res) => {
    const {
      query: { limit, page, self, order, ...rest },
    } = req;

    const courses = await req.services.biz.course.get(
      { self },
      { limit, page },
      {
        order: order?.map((item) => JSON.parse(item as any)),
        ...rest,
      }
    );

    await res.success(courses);
    return;
  }
);

export const POST = operationMiddleware(
  'createCourse',
  {
    'x-verified': true,
    operationId: 'createCourse',
    summary: 'Create Course',
    tags: ['Training'],
    requestBody: generateRequestBody(apiSchemas.CourseCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.CourseAttr),
    },
  },
  async (req, res) => {
    const { body } = req;

    try {
      const course = await req.services.biz.course.create(undefined, body);

      await res.success(course);
      return;
    } catch (error) {
      throw error;
    }
  }
);
