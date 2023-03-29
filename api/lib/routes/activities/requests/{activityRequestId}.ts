import { apiSchemas } from 'lib/generators';
import {
  generateEmptyResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getActivityRequest',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getActivityRequest',
    summary: 'Get Activity Request',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityRequestId],
    responses: {
      200: generateResponseSchema(apiSchemas.ActivityRequestAttr),
      404: responses.notFound.generate('Activity Request'),
    },
  },

  async (req, res) => {
    const {
      params: { activityRequestId },
    } = req;

    try {
      const activityRequest = await req.services.biz.activityRequest.getOneById(
        undefined,
        activityRequestId
      );

      await res.success(activityRequest);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(404, { error: 'Activity Request not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateActivityRequest',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'updateActivityRequest',
    summary: 'Update Activity Request',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityRequestId],
    requestBody: generateRequestBody(apiSchemas.ActivityRequestModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.ActivityRequestAttr),
      404: responses.notFound.generate('Activity Request'),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { activityRequestId },
    } = req;

    try {
      const activityRequest = await req.services.biz.activityRequest.updateById(
        undefined,
        activityRequestId,
        body
      );

      await res.success(activityRequest);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(404, { error: 'Activity Request not found' });
      }
      throw error;
    }
  }
);

export const DELETE = operationMiddleware(
  'deleteActivityRequest',
  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'deleteActivityRequest',
    summary: 'Delete Activity Request',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityRequestId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Activity Request'),
    },
  },

  async (req, res) => {
    const {
      params: { activityRequestId },
    } = req;

    try {
      await req.services.biz.activityRequest.deleteById(
        undefined,
        activityRequestId
      );

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(404, { error: 'Activity Request not found' });
      }
      throw error;
    }
  }
);
