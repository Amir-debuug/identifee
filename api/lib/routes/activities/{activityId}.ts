import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayRequestBody,
  generateEmptyResponseSchema,
  generateRequestBody,
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const DELETE = operationMiddleware(
  'deleteActivity',
  {
    operationId: 'deleteActivity',
    summary: 'Delete Activity',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('Activity'),
    },
  },

  isAuthorizedMiddleware(permissions.activities.delete) as any,
  async (req, res) => {
    const {
      params: { activityId },
    } = req;

    try {
      await req.services.biz.activity.deleteById(undefined, activityId);

      await res.success({});
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Activity not found' });
      }
      throw error;
    }
  }
);

export const GET = operationMiddleware(
  'getActivityById',
  {
    operationId: 'getActivityById',
    summary: 'Get Activity By Id',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityId],
    responses: {
      200: generateResponseSchema(apiSchemas.ActivityAttr),
      404: responses.notFound.generate('Activity'),
    },
  },

  isAuthorizedMiddleware(permissions.activities.view) as any,
  async (req, res) => {
    const {
      params: { activityId },
    } = req;

    try {
      const activity = await req.services.biz.activity.getOneById(
        undefined,
        activityId
      );

      await res.success(activity);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Activity not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateActivity',
  {
    operationId: 'updateActivity',
    summary: 'Update Activity',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityId],
    requestBody: generateRequestBody(apiSchemas.ActivityModifyBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.ActivityAttrs),
      404: responses.notFound.generate('Activity'),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { activityId },
    } = req;

    try {
      const activity = await req.services.biz.activity.updateById(
        undefined,
        activityId,
        body
      );

      await res.success(activity);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(404, { error: 'Activity not found' });
      }
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createActivityOwners',
  {
    operationId: 'createActivityOwners',
    summary: 'Create Activity Owners',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityId],
    requestBody: generateArrayRequestBody(apiSchemas.ActivityOwnerCreateBiz),
    responses: {
      200: generateEmptyResponseSchema(),
    },
  },

  async (req, res) => {
    const {
      body,
      params: { activityId },
    } = req;

    try {
      await req.services.biz.activityOwner.bulkCreate(
        undefined,
        activityId,
        body
      );

      await res.success({});
      return;
    } catch (error) {
      throw error;
    }
  }
);