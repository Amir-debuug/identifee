import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateEmptyResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const DELETE = operationMiddleware(
  'deleteActivityOwner',
  {
    operationId: 'deleteActivityOwner',
    summary: 'Delete Activity Owner',
    tags: ['activities'],
    security: [{ Bearer: [] }],
    parameters: [parameters.activityId, parameters.userId],
    responses: {
      200: generateEmptyResponseSchema(),
      404: responses.notFound.generate('ActivityOwner'),
    },
  },

  isAuthorizedMiddleware(permissions.activities.delete) as any,
  async (req, res) => {
    const {
      params: { activityId, user_id },
    } = req;

    try {
      await req.services.biz.activityOwner.deleteByCompositeIds(
        {},
        activityId,
        user_id
      );

      await res.success({});
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'ActivityOwner not found' });
      }
      throw error;
    }
  }
);
