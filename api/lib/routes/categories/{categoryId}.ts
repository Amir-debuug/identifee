import {
  generateErrorResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getCategory',
  {
    operationId: 'getCategory',
    summary: 'Get Category',
    tags: ['categories'],
    security: [{ Bearer: [] }],
    parameters: [parameters.categoryId],
    responses: {
      200: generateResponseSchema(apiSchemas.CategoryBizGetOneById),
      404: responses.notFound.generate('Category'),
    },
  },

  isAuthorizedMiddleware(permissions.categories.view) as any,
  async (req, res) => {
    const {
      params: { categoryId },
    } = req;

    try {
      const category = await req.services.biz.category.getOneById(
        undefined,
        categoryId
      );

      await res.success(category);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Category not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateCategory',
  {
    operationId: 'updateCategory',
    summary: 'Update Category',
    tags: ['categories'],
    security: [{ Bearer: [] }],
    parameters: [parameters.categoryId],
    requestBody: generateRequestBody(apiSchemas.CategoryModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.CategoryAttr),
      404: responses.notFound.generate('Category'),
    },
  },

  isAuthorizedMiddleware(permissions.categories.edit) as any,
  async (req, res) => {
    const {
      params: { categoryId },
      body,
    } = req;

    try {
      const category = await req.services.biz.category.updateById(
        undefined,
        categoryId,
        body
      );

      await res.success(category);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Category not found' });
      }
      throw error;
    }
  }
);

export const DELETE = operationMiddleware(
  'deleteCategory',
  {
    operationId: 'deleteCategory',
    summary: 'Delete Category',
    tags: ['categories'],
    security: [{ Bearer: [] }],
    parameters: [parameters.categoryId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Category'),
      409: generateErrorResponseSchema({
        description: 'Conflict',
        errors: [
          { title: 'Category is assigned to lessons' },
          { title: 'Category is assigned to courses' },
        ],
      }),
    },
  },

  isAuthorizedMiddleware(permissions.categories.delete) as any,
  async (req, res) => {
    const {
      params: { categoryId },
    } = req;

    try {
      await req.services.biz.category.deleteById(undefined, categoryId);

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Category not found' });
      }
      if (error instanceof req.exception.Conflict) {
        return res.error(error.status, { error: error.message as any });
      }
      throw error;
    }
  }
);
