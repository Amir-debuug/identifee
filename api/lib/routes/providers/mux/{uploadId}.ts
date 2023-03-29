import { apiSchemas } from 'lib/generators';
import {
  generateResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getMuxVideoByUploadId',

  {
    'x-verified': true,
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getMuxVideoByUploadId',
    summary: 'Get Mux Video',
    tags: ['External API Providers', 'Provider - Mux'],
    security: [{ Bearer: [] }],
    parameters: [parameters.uploadId],
    responses: {
      200: generateResponseSchema(apiSchemas.Asset),
      404: responses.notFound.generate('upload'),
    },
  },

  async (req, res) => {
    const {
      params: { uploadId },
    } = req;

    try {
      const asset = await req.services.providers.mux.getAssetByUploadId(
        uploadId
      );

      await res.success(asset);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'upload not found' });
      }

      throw error;
    }
  }
);
