import {
  generateResponseSchema,
  operationMiddleware,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { Merchant } from 'lib/biz/reportGeneratorBiz/Merchant';
import { apiSchemas } from 'lib/generators';

export const GET = operationMiddleware(
  'getMerchantReport',
  {
    operationId: 'getMerchantReport',
    summary: 'Get merchant report',
    tags: ['reports'],
    security: [{ Bearer: [] }],
    parameters: [parameters.siteId],
    responses: {
      200: generateResponseSchema(apiSchemas.MerchantOutput),
      404: responses.notFound.generate('MerchantReport'),
    },
  },

  async (req, res) => {
    const {
      params: { site_id },
      query: { fromDate, toDate },
    } = req;

    const merchantService = await Merchant.init(req, {
      fromDate,
      toDate,
      siteId: site_id,
    });

    if (!merchantService.output) {
      return res.error(404, { error: 'MerchantReport not found' });
    }

    await res.success(merchantService.output);
    return;
  }
);
