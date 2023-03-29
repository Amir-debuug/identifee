// TODO rename /feed/file to a more RESTful route

import {
  generateResponseSchema,
  operationMiddleware,
  queries,
} from 'lib/middlewares/openapi';

export const GET = operationMiddleware(
  'getFeedFile',
  {
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getFeedFile', // maybe this should be in files?
    summary: 'Get Feed Files',
    tags: ['feed', 'files'],
    security: [{ Bearer: [] }],
    parameters: [
      ...queries.pagination,
      {
        in: 'query',
        name: 'contact_id',
        schema: {
          type: 'string',
        },
      },
      {
        in: 'query',
        name: 'deal_id',
        schema: {
          type: 'string',
        },
      },
      {
        in: 'query',
        name: 'organization_id',
        schema: {
          type: 'string',
        },
      },
    ],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: [],
        properties: {},
      }),
    },
  },

  async (req, res) => {
    const { query } = req;
    let contactId = req.query.contact_id;

    if (req.user.jwt.scope === 'guest') {
      contactId = req.user.jwt.contact_id;
    }

    if (
      req.user.jwt.scope === 'guest' &&
      ((contactId && req.user.jwt.contact_id !== contactId) ||
        (req.user.jwt.resource_access &&
          req.user.jwt.resource_access.organization &&
          query.organization_id !==
            req.user.jwt.resource_access.organization[0].id))
    ) {
      throw new req.exception.Forbidden();
    }

    const files = await req.services.data.feedFile.getFiles(query);

    return res.success(files);
  }
);
