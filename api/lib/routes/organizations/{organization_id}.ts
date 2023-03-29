import {
  generateJSONBase,
  generateResponseSchema,
  operationMiddleware,
  parameters,
  responses,
  schemas,
} from 'lib/middlewares/openapi';
import { organizationPrincipalOwnerValidator } from 'lib/middlewares/ownerValidator';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import { organizationServiceFactory } from 'lib/services';
import { permissions } from 'lib/middlewares/sequelize';

const contactsPermissions = permissions.contacts;

export const GET = operationMiddleware(
  'getOrganizationById',
  {
    'x-authz': {
      allowedScopes: ['profile', 'guest', 'impersonation'],
    },
    operationId: 'getOrganizationById',
    summary: 'Get Organization',
    tags: ['organizations'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: ['organization'],
        properties: {
          organization: schemas.organization,
        },
      }),
      404: responses.notFound.generate('Organization'),
    },
  },

  async (req, res) => {
    const {
      params: { organization_id },
    } = req;

    try {
      const organization = await req.services.biz.organization.getOneById(
        undefined,
        organization_id
      );

      // TODO fix type
      await res.success({
        organization,
      });
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(404, { error: 'Organization not found' });
      }
      throw error;
    }
  }
);

export const PUT = operationMiddleware(
  'updateOrganization',
  {
    operationId: 'updateOrganization',
    summary: 'Update Organization',
    tags: ['organizations'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId],
    requestBody: {
      required: true,
      ...generateJSONBase({
        type: 'object',
        properties: {
          name: {
            description: 'Organization name',
            type: 'string',
          },
          status: {
            description: 'Status',
            type: 'string',
            nullable: true,
          },
          industry: {
            description: 'Organization industry',
            type: 'string',
            nullable: true,
          },
          address_city: {
            type: 'string',
            nullable: true,
          },
          address_country: {
            type: 'string',
            nullable: true,
          },
          address_postalcode: {
            type: 'string',
            nullable: true,
          },
          address_state: {
            type: 'string',
            nullable: true,
          },
          address_street: {
            type: 'string',
            nullable: true,
          },
          address_suite: {
            type: 'string',
            nullable: true,
          },
          sic_code: { type: 'string', nullable: true },
          naics_code: { type: 'string', nullable: true },
          employees: { type: 'integer', nullable: true },
          annual_revenue_merchant: {
            nullable: true,
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          annual_revenue_treasury: {
            nullable: true,
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          annual_revenue_business_card: {
            nullable: true,
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          total_revenue: {
            nullable: true,
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          is_customer: { type: 'boolean', nullable: true },
          cif: { type: 'string', nullable: true },
          branch: { type: 'string', nullable: true },
          avatar: { type: 'string', nullable: true },
          label_id: { type: 'string', nullable: true },
          ticker_symbol: { type: 'string', nullable: true },
        },
      }),
    },
    responses: {
      200: generateResponseSchema(schemas.organization),
    },
  },
  isAuthorizedMiddleware(contactsPermissions.edit) as any,
  async (req, res) => {
    const { organization_id } = req.params;

    if (!req.user.auth.isAdmin && !req.user.auth.isOwner) {
      await organizationPrincipalOwnerValidator({
        id: organization_id,
        user: req.user,
      });
    }

    const body = { ...req.body, date_modified: new Date() };

    const service = organizationServiceFactory(req.user);
    await service.updateOrganization(organization_id, body);
    res.json({});
  }
);

export const DELETE = operationMiddleware(
  'deleteOrganization',
  {
    operationId: 'deleteOrganization',
    summary: 'Delete organization',
    tags: ['organizations'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId],
    responses: {
      204: {
        description: 'Organization deleted',
      },
    },
  },

  isAuthorizedMiddleware(contactsPermissions.delete) as any,
  async (req, res) => {
    const { organization_id } = req.params;

    if (!req.user.auth.isAdmin) {
      await organizationPrincipalOwnerValidator({
        id: organization_id,
        user: req.user,
      });
    }

    await req.services.data.organization.deleteOne(organization_id);

    res.status(204).end();
  }
);
