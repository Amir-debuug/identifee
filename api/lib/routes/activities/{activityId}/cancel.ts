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
  'cancelActivity',
  {
    operationId: 'cancelActivity',
    summary: 'Cancel Activity',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityId],
    requestBody: generateRequestBody({}),
    responses: {
      200: generateResponseSchema(apiSchemas.ActivityAttr),
      404: responses.notFound.generate('Activity'),
    },
  },

  isAuthorizedMiddleware(permissions.activities.edit) as any,
  async (req, res) => {
    const {
      params: { activityId },
    } = req;

    try {
      const updatedActivity = await req.services.biz.activity.cancelById(
        undefined,
        activityId
      );

      await res.success(updatedActivity);
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Activity not found' });
      }
      throw error;
    }
  }
);
