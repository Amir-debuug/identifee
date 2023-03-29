import util from 'util';
import { multipartHandler } from 'lib/controllers/files';
import {
  generateResponseSchema,
  operationMiddleware,
} from 'lib/middlewares/openapi';
import { PrimaryKey } from 'lib/types';
import { storage } from 'lib/storage';

const { STORAGE_S3_PUBLIC_BUCKET } = process.env;

export const POST = operationMiddleware(
  'uploadFile',
  {
    'x-authz': {
      allowedScopes: ['guest', 'profile', 'impersonation'],
    },
    operationId: 'uploadFile',
    summary: 'Upload File',
    tags: ['files'],
    security: [{ Bearer: [] }],
    requestBody: {
      required: true,
      // TODO define input for both content types
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {},
          },
        },
        'application/json': {
          schema: {
            type: 'object',
            properties: {},
          },
        },
      },
    },
    responses: {
      200: generateResponseSchema({
        type: 'object',
        // TODO define the response
        properties: {},
      }),
      // TODO find relevant errors
    },
  },

  async (req, res, next) => {
    const multipartHandlerPromise = util.promisify(multipartHandler);
    await multipartHandlerPromise(req, res as any); // modifies res.locals

    let keys: PrimaryKey | PrimaryKey[] = [];
    let createActivity = false;
    if (req.is('multipart/form-data')) {
      keys = res.locals.savedFiles;
      createActivity = true;
    } else {
      keys = await req.services.data.file.createOne(req.body as any, req.user);
    }

    try {
      const key = Array.isArray(keys) ? keys[0] : keys;
      const record = await req.services.data.file.readOne(key, req.query);

      // revisit this....
      if (createActivity) {
        const { contact_id, deal_id, organization_id } = res.locals.payload;

        // TODO merge feed and activity_file
        await req.services.data.feedLog.create({
          tenant_id: req.user.tenant,
          summary: 'File uploaded',
          type: 'file',
          object_data: {
            id: record.id,
            filename_download: record.filename_download,
            filesize: record.filesize,
            type: record.type,
            uploaded_on: record.uploaded_on,
          },
          // todo check if this is correct for guests
          created_by: record.uploaded_by!,
          // bind it to guest contact
          contact_id:
            req.user.jwt.scope === 'guest'
              ? req.user.jwt.contact_id
              : contact_id,
          // bind it to guest organization
          organization_id:
            req.user.jwt.scope === 'guest'
              ? organization_id ||
                req.user.jwt.resource_access.organization[0].id
              : organization_id,
          deal_id,
        });

        await req.services.data.feedFile.addFile({
          tenant_id: req.user.tenant,
          created_by: record.uploaded_by!,
          contact_id:
            req.user.jwt.scope === 'guest'
              ? req.user.jwt.contact_id
              : contact_id,
          organization_id:
            req.user.jwt.scope === 'guest'
              ? organization_id ||
                req.user.jwt.resource_access.organization[0].id
              : organization_id,
          file_id: record.id,
          deal_id,
          assigned_user_id:
            req.user.jwt.scope === 'guest'
              ? req.user.jwt.contact_id
              : record.uploaded_by!,
        });
      }

      const disk = storage.disk(record.storage);
      const { signedUrl } = await disk.getSignedUrl(
        record.filename_disk as string,
        { expiry: 604800 }
      );

      res.locals.payload = {
        data: record,
        public_url: `https://${STORAGE_S3_PUBLIC_BUCKET}.s3.amazonaws.com`,
        url: signedUrl,
      };
    } catch (error) {
      if (error instanceof req.exception.Forbidden) {
        return next();
      }

      throw error;
    }

    return res.success({
      ...res.locals.payload,
    });
  }
);
