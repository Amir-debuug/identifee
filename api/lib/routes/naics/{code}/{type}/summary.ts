import { insightBizFactory } from 'lib/biz';
import { apiSchemas } from 'lib/generators';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getNAICSTypeSummaryByCode',
  {
    'x-verified': true,
    operationId: 'getNAICSTypeSummaryByCode',
    summary: 'Get NAICS Type Summary By NAICS',
    tags: ['naics'],
    security: [{ Bearer: [] }],
    parameters: [parameters.naicsCode, parameters.naicsType],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        oneOf: [
          apiSchemas.InsightRpmgBizGetOneByCode,
          apiSchemas.InsightSpBizGetOneByCode,
        ],
      }),
      404: responses.notFound.generate('NAICS'),
    },
  },

  async (req, res) => {
    const {
      params: { code, type },
    } = req;

    try {
      const factory = insightBizFactory(type, req);
      const summary = await factory.getOneByCode(code);

      await res.success(summary);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'NAICS not found' });
      }
      throw error;
    }
  }
);
