import { apiSchemas } from 'lib/generators';
import { isAuthorizedMiddleware } from 'lib/middlewares/auth';
import {
  generateArrayResponseSchema,
  generateArrayRequestBody,
} from 'lib/middlewares/openapi';
import { permissions } from 'lib/middlewares/sequelize';
import { operationMiddleware } from 'lib/utils';

export const POST = operationMiddleware(
  'createPipelineTeam',
  {
    operationId: 'createPipelineTeam',
    summary: 'Create Pipeline Team',
    tags: ['pipelineTeams'],
    security: [{ Bearer: [] }],
    requestBody: generateArrayRequestBody(apiSchemas.PipelineTeamCreateBiz),
    responses: {
      200: generateArrayResponseSchema(apiSchemas.PipelineTeamAttr),
    },
  },

  isAuthorizedMiddleware(permissions.privileged.owner) as any,
  async (req, res) => {
    const { body } = req;

    const pipelineTeams = await req.services.biz.pipelineTeam.create(
      undefined,
      body
    );

    await res.success(pipelineTeams);
    return;
  }
);
