import { apiSchemas } from 'lib/generators';
import { generateResponseSchema, queries } from 'lib/middlewares/openapi';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getAuthContextNotifications',
  {
    'x-verified': true,
    operationId: 'getAuthContextNotifications',
    summary: 'Get Context Notifications',
    description:
      'Returns a list of events relevant to the current logged in user.\n' +
      'This is either because the user owns the resource, is the assigned user, or owns the resource (if applicable).',
    tags: ['Profile Management'],
    security: [{ Bearer: [] }],
    parameters: [...queries.pagination],
    responses: {
      200: generateResponseSchema(apiSchemas.AuditNotificationBizGet),
    },
  },

  async (req, res) => {
    const {
      query: { limit, page },
    } = req;

    const notifications = await req.services.biz.auditNotification.get(
      { self: true },
      { limit, page }
    );

    await res.success(notifications);
    return;
  }
);
