import {
  generateErrorResponseSchema,
  generateJSONBase,
  generateResponseSchema,
  operationMiddleware,
  responses,
} from 'lib/middlewares/openapi';

export const POST = operationMiddleware(
  'createGuestToken',
  {
    operationId: 'createGuestToken',
    summary: 'Create a Guest JWT',
    description:
      'Create a guest JWT based on the grant type. Guest should have been previously invited by another owner.',
    tags: ['auth'],
    parameters: [],
    requestBody: {
      required: true,
      ...generateJSONBase({
        oneOf: [
          {
            type: 'object',
            additionalProperties: false,
            required: ['grant_type', 'redirect_url', 'username'],
            properties: {
              grant_type: {
                type: 'string',
                enum: ['guest_generate'],
              },
              redirect_url: {
                description: 'The URL the guest user should be navigated to',
                type: 'string',
              },
              username: {
                type: 'string',
              },
            },
          },
        ],
      }),
    },
    responses: {
      200: generateResponseSchema({}),
      400: generateErrorResponseSchema({
        description: 'Invalid input provided',
        errors: [
          {
            title: 'Invalid guest information',
          },
          {
            title: 'Invalid token provided',
          },
        ],
      }),
      404: responses.notFound.generate('Guest'),
    },
  },

  async (req, res) => {
    const {
      body: { username, redirect_url },
    } = req;

    await req.services.biz.auth.generateGuestToken(undefined, {
      email: username,
      redirect_url,
    });

    return res.success({});
  }
);
