import { reportGeneratorBizFactory } from 'lib/biz';
import {
  generateResponseSchema,
  operationMiddleware,
  parameters,
  responses,
} from 'lib/middlewares/openapi';

export const GET = operationMiddleware(
  'getReport',
  {
    // TODO eventually allow access from all valid tokens
    'x-authz': {
      requiredScope: 'guest',
    },
    operationId: 'getReport',
    summary: 'Get a report',
    tags: ['reports'],
    security: [{ Bearer: [] }],
    parameters: [parameters.reportId],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        properties: {},
      }),
      404: responses.notFound.generate('Report'),
    },
  },

  async (req, res) => {
    const {
      params: { report_id },
    } = req;

    try {
      const report = await req.services.biz.report.getOneById(
        undefined,
        report_id
      );
      const reportGenerator = reportGeneratorBizFactory({
        input: report.input,
      });
      const output = await reportGenerator.calculate();

      await res.success({
        ...report,
        output,
      });
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Report not found' });
      }
      throw error;
    }
  }
);
