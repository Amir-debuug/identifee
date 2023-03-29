import {
  generateResponseSchema,
  operationMiddleware,
  parameters,
  queries,
  responses,
} from 'lib/middlewares/openapi';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { permissions } from 'lib/middlewares/sequelize';

export const GET = operationMiddleware(
  'getOrganizationContacts',
  {
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getOrganizationContacts',
    summary: 'Get Organization Contacts',
    tags: ['organizations', 'contacts'],
    security: [{ Bearer: [] }],
    parameters: [...queries.pagination, parameters.organizationId],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: [],
        properties: {},
      }),
      404: responses.notFound.generate('Organization'),
    },
  },

  isAuthorizedMiddleware(permissions.contacts.view) as any,
  async (req, res) => {
    const {
      query,
      params: { organization_id },
    } = req;

    const contacts =
      await req.services.data.contact.getContactsByOrganizationId({
        organizationId: organization_id,
        query,
      });

    return res.success(contacts);
  }
);
