import { apiSchemas } from 'lib/generators';
import {
  generateEmptyResponseSchema,
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'setFieldPreference',
  {
    operationId: 'setFieldPreference',
    summary: 'Set Fields Preference',
    description: 'set array of fields preference.',
    tags: ['fields'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.SetFieldPreference),
    responses: {
      200: generateEmptyResponseSchema(),
    },
  },

  async (req, res) => {
    const {
      body: { fieldIds, type },
    } = req;

    await req.services.biz.field.setPreferences(undefined, type, fieldIds);

    await res.success({});
    return;
  }
);
