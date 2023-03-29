import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayRequestBody,
  generateArrayResponseSchema,
  parameters,
  responses,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const GET = operationMiddleware(
  'getMemberTeams',
  {
    operationId: 'getMemberTeams',
    summary: 'Get Member Teams',
    tags: ['memberTeams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.userId],
    responses: {
      200: generateArrayResponseSchema(apiSchemas.TeamMemberAttr),
      404: responses.notFound.generate('MemberTeam'),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const {
      params: { user_id },
    } = req;

    try {
      const memberTeams = await req.services.biz.teamMember.getByUserId(
        undefined,
        user_id
      );
      await res.success(memberTeams);
      return;
    } catch (error) {
      if (error instanceof req.exception.ResourceNotFound) {
        return res.error(error.status, { error: 'MemberTeam not found' });
      }
      throw error;
    }
  }
);

export const POST = operationMiddleware(
  'createMemberTeams',
  {
    operationId: 'createMemberTeams',
    summary: 'Create Member Team',
    tags: ['memberTeams'],
    security: [{ Bearer: [] }],
    parameters: [parameters.userId],
    requestBody: generateArrayRequestBody(apiSchemas.MemberTeamCreateBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.TeamMemberAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { body } = req;

    const memberTeams = await req.services.biz.teamMember.bulkUpsert(
      undefined,
      body
    );

    await res.success(memberTeams);
    return;
  }
);
