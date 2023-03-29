import {
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const PUT = operationMiddleware(
  'updateSearch',
  {
    operationId: 'updateSearch',
    summary: 'Update Search',
    tags: ['Searches'],
    security: [{ Bearer: [] }],
    parameters: [parameters.searchId],
    requestBody: generateRequestBody(apiSchemas.SearchModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.SearchAttr),
      404: responses.notFound.generate('Search'),
    },
  },

  isAuthorizedMiddleware(permissions.prospects.edit) as any,
  async (req, res) => {
    const {
      body,
      params: { searchId },
    } = req;

    try {
      const resource = await req.services.biz.search.updateById(
        undefined,
        searchId,
        body
      );

      await res.success(resource);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Search not found' });
      }
      throw error;
    }
  }
);

export const DELETE = operationMiddleware(
  'deleteSearch',
  {
    operationId: 'deleteSearch',
    summary: 'Delete Search',
    tags: ['Searches'],
    security: [{ Bearer: [] }],
    parameters: [parameters.searchId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Search'),
    },
  },

  isAuthorizedMiddleware(permissions.prospects.delete) as any,
  async (req, res) => {
    const {
      params: { searchId },
    } = req;

    try {
      await req.services.biz.search.deleteById(undefined, searchId);

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Search not found' });
      }

      throw error;
    }
  }
);
