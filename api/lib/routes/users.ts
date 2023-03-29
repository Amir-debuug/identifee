import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayRequestBody,
  generateBulkQueryParam,
  generateEmptyResponseSchema,
  generatePaginatedResponseSchema,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getUsers',
  {
    'x-verified': true,
    operationId: 'getUsers',
    summary: 'Get Users',
    tags: ['users'],
    security: [{ Bearer: [] }],
    parameters: [
      ...generateBulkQueryParam(apiSchemas.Pagination),
      ...generateBulkQueryParam(apiSchemas.UserQueryBiz),
    ],
    responses: {
      200: generatePaginatedResponseSchema(apiSchemas.GetUsers, 'users'),
    },
  },
  async (req, res) => {
    const {
      query: {
        page,
        limit,
        order,
        search,
        status,
        roleId,
        excludeAdmins,
        self,
      },
    } = req;

    const users = await req.services.biz.user.get(
      { self },
      { limit, page },
      { order, search, status, roleId, excludeAdmins }
    );
    // TODO refactor to `data` instead of `users`
    const response = {
      users: users.data,
      pagination: users.pagination,
    };

    await res.success(response);
    return;
  }
);

export const POST = operationMiddleware(
  'inviteUsers',
  {
    operationId: 'inviteUsers',
    summary: 'invite Users',
    tags: ['users'],
    security: [{ Bearer: [] }],
    requestBody: generateArrayRequestBody(apiSchemas.UserInviteBiz),
    responses: {
      200: generateEmptyResponseSchema(),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { body } = req;
    await req.services.biz.user.sendInvites(undefined, body);

    await res.success({});
    return;
  }
);
