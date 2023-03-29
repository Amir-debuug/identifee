import {
  generateBulkQueryParam,
  generatePaginatedResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { operationMiddleware } from 'lib/utils';
import { permissions } from 'lib/middlewares/sequelize';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getProductsByDealId',
  {
    operationId: 'getProductsByDealId',
    summary: 'Get Products By Deal Id',
    tags: ['deals'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      parameters.dealId,
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.DealProductAttr),
      404: responses.notFound.generate('Deal'),
    },
  },

  isAuthorizedMiddleware(permissions.deals.view) as any,
  async (req, res) => {
    const {
      params: { deal_id },
      query: { page, limit },
    } = req;

    const products = await req.services.biz.dealProduct.getProductsByDealId(
      undefined,
      { limit, page },
      deal_id
    );

    res.success(products);

    return;
  }
);
