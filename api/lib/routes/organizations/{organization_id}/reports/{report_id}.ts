import { parseReportDate, reportGeneratorBizFactory } from 'lib/biz';
import {
  generateErrorResponseSchema,
  generateJSONBase,
  generateResponseSchema,
  operationMiddleware,
  parameters,
  responses,
  schemas,
} from 'lib/middlewares/openapi';
import { organizationServiceFactory, reportServiceFactory } from 'lib/services';
import { TenantService } from '../../../../services/tenant';

export const GET = operationMiddleware(
  'getOrganizationReport',
  {
    operationId: 'getOrganizationReport',
    summary: 'Get Report for an Organization',
    tags: ['reports'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId, parameters.reportId],
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: ['id', 'organization_id', 'created_by', 'type', 'input'],
        properties: {
          id: {
            type: 'string',
          },
          organization_id: {
            type: 'string',
          },
          created_by: {
            type: 'string',
          },
          file_id: {
            type: 'string',
          },
          type: {
            type: 'string',
            enum: ['TREASURY'],
          },
          input: schemas.reportInput,
          month: {
            description: 'In "YYYYMM" format',
            type: 'string',
          },
          output: schemas.reportOutput,
        },
      }),
      404: responses.notFound.generate('Report'),
    },
  },

  async (req, res) => {
    const {
      params: { organization_id, report_id },
      user,
    } = req;

    const organizationService = organizationServiceFactory(user);
    const organization = await organizationService.getOrganizationById(
      organization_id
    );
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const reportService = reportServiceFactory(user);
    const report = await reportService.getOne(report_id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const reportGenerator = reportGeneratorBizFactory({ input: report.input });
    const output = await reportGenerator.calculate();

    return res.success({
      ...report,
      output,
    });
  }
);

export const PUT = operationMiddleware(
  'updateOrganizationReport',
  {
    operationId: 'updateOrganizationReport',
    summary: 'Update Report for an Organization',
    tags: ['reports'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId, parameters.reportId],
    requestBody: {
      ...generateJSONBase({
        type: 'object',
        required: ['input', 'month'],
        properties: {
          input: schemas.reportInput,
          month: {
            description: 'In "YYYYMM" format',
            type: 'string',
          },
        },
      }),
    },
    responses: {
      200: generateResponseSchema({
        type: 'object',
        required: [
          'id',
          'organization_id',
          'created_by',
          'type',
          'input',
          'output',
        ],
        properties: {
          id: {
            type: 'string',
          },
          organization_id: {
            type: 'string',
          },
          created_by: {
            type: 'string',
          },
          file_id: {
            type: 'string',
          },
          type: {
            type: 'string',
            enum: ['TREASURY'],
          },
          input: schemas.reportInput,
          month: {
            description: 'In "YYYYMM" format',
            type: 'string',
          },
          output: schemas.reportOutput,
        },
      }),
      404: responses.notFound.generate('Organization'),
      422: generateErrorResponseSchema({
        description: 'Not processable',
        errors: [
          {
            title: 'Not processable',
          },
        ],
      }),
    },
  },

  async (req, res) => {
    const {
      params: { organization_id, report_id },
      user,
      body,
    } = req;

    const organizationService = organizationServiceFactory(user);
    const organization = await organizationService.getOrganizationById(
      organization_id
    );
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const reportService = reportServiceFactory(user);
    let report = await reportService.getOne(report_id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const tenant = await TenantService.getTenantById(organization.tenant_id);

    const reportInput = {
      ...body.input,
      date: parseReportDate(body.month),
      logo_white: tenant.settings.light_theme_logo,
      logo_dark: tenant.logo,
      proposed_bank_name: tenant.name,
    };

    const reportGenerator = reportGeneratorBizFactory({ input: reportInput });
    const reportResult = await reportGenerator.generate({
      tenant: user.tenant,
      id: report.created_by,
    } as any);
    if (!reportResult) {
      return res.status(422).json({ error: 'Report not processable' });
    }

    const reportBody = {
      ...body,
      ...{ organization_id },
    };
    report = await reportService.update(report_id, {
      ...reportBody,
      ...reportResult,
      tenant_id: req.user.tenant,
      type: reportBody.input.type,
    });

    await res.success({
      ...report!,
      output: reportResult.output,
    });
    return;
  }
);

export const DELETE = operationMiddleware(
  'deleteOrganizationReport',
  {
    operationId: 'deleteOrganizationReport',
    summary: 'Delete Report for an Organization',
    tags: ['reports'],
    security: [{ Bearer: [] }],
    parameters: [parameters.organizationId, parameters.reportId],
    responses: {
      200: generateResponseSchema({}),
      404: responses.notFound.generate('Organization', 'Report'),
    },
  },

  async (req, res) => {
    const {
      params: { organization_id, report_id },
      user,
    } = req;

    const organizationService = organizationServiceFactory(user);
    const organization = await organizationService.getOrganizationById(
      organization_id
    );
    if (!organization) {
      return res.error(404, { error: 'Organization not found' });
    }

    try {
      await req.services.biz.report.deleteById(undefined, report_id);

      return res.success({});
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'Report not found' });
      }
      throw error;
    }
  }
);
