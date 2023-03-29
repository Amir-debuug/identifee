import { apiSchemas } from 'lib/generators';
import {
  generateArrayResponseSchema,
  generateRequestBody,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'createDefaultFields',
  {
    operationId: 'createDefaultFields',
    summary: 'Create Default Fields',
    description:
      'Creates a default fields for the tenant you are logged in for.',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.FieldDefaultCreateBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.FieldAttr),
    },
  },

  async (req, res) => {
    const {
      body: { type },
    } = req;

    const fields = await req.services.biz.field.createDefault(undefined, {
      type,
    });

    await res.success(fields);
    return;
  }
);
