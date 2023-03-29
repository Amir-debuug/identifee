import {
  generateBulkQueryParam,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getCategories',
  {
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getCategories',
    summary: 'Get Categories',
    tags: ['categories'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.GetCategoriesQuery),
    ],
    responses: {
      200: generateResponseSchema(apiSchemas.CategoryBizGet),
    },
  },

  isAuthorizedMiddleware(permissions.lessons.view) as any,
  async (req, res) => {
    const {
      query: { limit, order, page, search, extraData },
    } = req;

    try {
      const categories = await req.services.biz.category.get(
        undefined,
        { limit, page },
        {
          extraData,
          order,
          search,
        }
      );

      await res.success(categories);
      return;
    } catch (error) {
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createCategory',
  {
    operationId: 'createCategory',
    summary: 'Create Category',
    tags: ['categories'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.CategoryCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.CategoryAttr),
    },
  },

  isAuthorizedMiddleware(permissions.lessons.create) as any,
  async (req, res) => {
    const { body } = req;

    try {
      const category = await req.services.biz.category.create(undefined, body);

      await res.success(category);
      return;
    } catch (error) {
      throw error;
    }
  }
);
