import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateResponseSchema,
  parameters,
  queries,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const DELETE = operationMiddleware(
  'deleteStage',
  {
    operationId: 'deleteStage',
    summary: 'Delete Stage',
    tags: ['stages'],
    security: [{ Bearer: [] }],
    parameters: [parameters.stageId, queries.transferId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Stage'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { stageId },
      query: { transferId },
    } = req;

    try {
      await req.services.biz.tenantDealStage.delete(
        undefined,
        stageId,
        transferId
      );

      await res.success({});
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Stage not found' });
      }
      throw error;
    }
  }
);
