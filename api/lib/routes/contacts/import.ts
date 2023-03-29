import { apiSchemas } from 'lib/generators';
import { generateResponseSchema, responses } from 'lib/middlewares/openapi';
import { ContactImportBiz } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';
import csv from 'lib/utils/csv';
import multer from 'multer';
import { Readable } from 'stream';

export const POST = operationMiddleware(
  'contactImport',
  {
    operationId: 'contactImport',
    summary: 'Import Contacts',
    tags: ['contacts', 'import'],
    security: [{ Bearer: [] }],
    parameters: [],
    requestBody: {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            required: [],
            properties: {
              file: {
                type: 'string',
                format: 'binary',
              },
              updateExisting: {
                type: 'boolean',
              },
            },
          },
        },
        'application/json': {
          schema: {
            type: 'object',
            required: ['contacts'],
            properties: {
              update_existing: {
                type: 'boolean',
              },
              contacts: {
                type: 'array',
                items: apiSchemas.ContactImportBiz,
              },
            },
          },
        },
      },
    },
    responses: {
      200: generateResponseSchema(apiSchemas.ContactBizBulkImport),
      400: responses.badRequest.generate(
        'File not provided',
        'Invalid mime type'
      ),
    },
  },

  multer().single('file') as any,
  async (req, res) => {
    const { file } = req;

    const importLimit = 1000;
    let failedItems: Partial<ContactImportBiz>[] = [];

    let contacts: ContactImportBiz[] = [];
    let updateExisting = req.query.updateExisting === 'true';

    // this means it's JSON
    if ('contacts' in req.body) {
      contacts = req.body.contacts;
      updateExisting = req.body.update_existing || updateExisting;
    }
    // this is for multipart files
    else {
      if (!file) {
        return res.error(400, { error: 'File not provided' });
      }
      if (file.mimetype !== 'text/csv') {
        return res.error(400, { error: 'Invalid mime type' });
      }
      const csvContacts = await csv.parser<ContactImportBiz>(
        Readable.from(file.buffer.toString('utf-8')),
        {
          delimiter: ',',
          columns: true,
        }
      );
      // csv allows >limit, need to splice and then find issues within range
      const csvContactsSpliced = csvContacts.splice(0, importLimit);

      failedItems = csvContactsSpliced.filter((contact) => {
        return !contact.first_name || !contact.last_name || !contact.email_work;
      });
      contacts = csvContactsSpliced
        .filter((contact) => {
          return contact.first_name && contact.last_name && contact.email_work;
        })
        .map((contact) => {
          const contactToImport = {
            first_name: contact.first_name,
            last_name: contact.last_name,
            email_work: contact.email_work,
            title: contact.title,
            email_other: contact.email_other,
            phone_work: contact.phone_work,
            phone_mobile: contact.phone_mobile,
            phone_home: contact.phone_home,
            phone_other: contact.phone_other,
          };
          if (contact.organization) {
            return {
              ...contactToImport,
              organization: contact.organization,
            };
          }
          return contactToImport;
        }) as ContactImportBiz[];

      // in case csv is attempting to import beyond limit
      if (csvContacts.length > importLimit) {
        failedItems = failedItems.concat(...csvContacts.slice(importLimit));
      }
    }

    const imports = await req.services.biz.contact.bulkImport(
      undefined,
      contacts,
      {
        updateExisting,
      }
    );

    await res.success({
      itemsFailed: failedItems.concat(...imports.itemsFailed),
      totalItems: imports.totalItems,
      contacts: imports.contacts,
    });
    return;
  }
);
