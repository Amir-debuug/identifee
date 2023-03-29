import { apiSchemas } from 'lib/generators';
import {
  generateRequestBody,
  generateResponseSchema,
} from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'createVideo',
  {
    'x-verified': true,
    operationId: 'createVideo',
    summary: 'Create a Video',
    description:
      'Creates an upload location on our third party API video provider, Mux.\n' +
      'The returned entry will have a Mux upload id and a Mux upload url. The\n' +
      'Mux upload url is where you should upload the video file to.',
    tags: ['Videos'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.VideoCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.VideoAttr),
    },
  },
  async (req, res) => {
    const { body } = req;

    try {
      const video = await req.services.biz.video.create(undefined, body);

      await res.success(video);
      return;
    } catch (error) {
      throw error;
    }
  }
);
