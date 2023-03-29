import {
  generateErrorResponseSchema,
  generateJSONBase,
  generateResponseSchema,
  operationMiddleware,
  schemas,
} from 'lib/middlewares/openapi';

export const POST = operationMiddleware(
  'tokenIntrospection',
  {
    operationId: 'tokenIntrospection',
    summary: 'Token Introspection',
    description: 'Introspects a given token to check its contents and validity',
    tags: ['auth'],
    parameters: [],
    requestBody: {
      required: true,
      ...generateJSONBase({
        type: 'object',
        required: ['token'],
        properties: {
          token: {
            type: 'string',
          },
        },
      }),
    },
    responses: {
      200: generateResponseSchema({
        type: 'object',
        oneOf: [
          {
            type: 'object',
            required: [
              'scope',
              'email',
              'contact_id',
              'shared_by',
              'resource_access',
            ],
            properties: {
              scope: {
                type: 'string',
                enum: ['guest'],
              },
              email: {
                type: 'string',
              },
              contact_id: {
                type: 'string',
              },
              shared_by: schemas.user,
              resource_access: {
                type: 'object',
                required: ['organization'],
                properties: {
                  organization: schemas.resourceAccess,
                },
              },
            },
          },
        ],
      }),
      400: generateErrorResponseSchema({
        description: 'Invalid token provided',
        errors: [
          {
            title: 'Invalid token information',
          },
        ],
      }),
    },
  },

  async (req, res) => {
    const { body } = req;

    try {
      const jwtPayload = req.services.util.jwt.verify(body.token);

      if (jwtPayload.scope === 'guest') {
        const sharedBy = await req.services.biz.user.getOneById(
          undefined,
          jwtPayload.shared_by_id
        );

        await res.success({
          ...jwtPayload,
          shared_by: sharedBy,
        });
        return;
      }

      await res.success(jwtPayload as any);
      return;
    } catch (error) {
      return res.error(400, { error: 'Invalid token information' });
    }
  }
);
