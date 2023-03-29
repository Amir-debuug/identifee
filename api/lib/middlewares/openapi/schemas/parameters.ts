import { apiSchemas } from 'lib/generators';
import { OpenAPIV3 } from 'openapi-types';

export function generateBulkQueryParam(
  schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject
): OpenAPIV3.ParameterObject[] {
  if ('$ref' in schema) {
    const schemaReference = schema.$ref.split('/').pop()!;
    return generateBulkQueryParam(
      apiSchemas[schemaReference as keyof typeof apiSchemas]
    );
  }

  if (schema.allOf) {
    return schema.allOf.reduce((acc, item) => {
      return [...acc, ...generateBulkQueryParam(item)];
    }, [] as OpenAPIV3.ParameterObject[]);
  }

  if (!schema.properties) {
    return [];
  }

  return Object.entries(schema.properties).map(([property, childSchema]) => {
    return generateQueryParam(
      property,
      ((schema as any).required || []).includes(property),
      childSchema as OpenAPIV3.SchemaObject
    );
  });
}

export function generateQueryParam(
  name: string,
  required: boolean,
  schema: OpenAPIV3.SchemaObject
) {
  return generateParameter('query', {
    name,
    required,
    schema,
  });
}

function generatePathParamNumber(name: string) {
  return generatePathParam(name, {
    type: 'number',
  });
}
function generatePathParamUUID(name: string) {
  return generatePathParam(name, {
    type: 'string',
    format: 'uuid',
  });
}

function generatePathParam(
  name: string,
  schema: OpenAPIV3.SchemaObject,
  required = true
) {
  return generateParameter('path', {
    name,
    required,
    schema,
  });
}

function generateParameter(
  type: 'query' | 'path',
  parameter: {
    name: string;
    required: boolean;
    schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject;
  }
): OpenAPIV3.ParameterObject {
  return {
    in: type,
    ...parameter,
  } as OpenAPIV3.ParameterObject;
}

export const parameters = {
  // number params
  categoryId: generatePathParamNumber('categoryId'),
  commentId: generatePathParamNumber('commentId'),

  // uuids
  activityId: generatePathParamUUID('activityId'),
  activityRequestId: generatePathParamUUID('activityRequestId'),
  analyticId: generatePathParamUUID('analyticId'),
  avatarId: generatePathParamUUID('avatar_id'),
  articleId: generatePathParamUUID('articleId'),
  badgeId: generatePathParamUUID('badgeId'),
  componentId: generatePathParamUUID('componentId'),
  contactId: generatePathParamUUID('contact_id'),
  courseId: generatePathParamUUID('course_id'),
  dashboardId: generatePathParamUUID('dashboardId'),
  dealId: generatePathParamUUID('deal_id'),
  fieldId: generatePathParamUUID('field_id'),
  groupId: generatePathParamUUID('groupId'),
  insightId: generatePathParamUUID('insight_id'),
  organizationId: generatePathParamUUID('organization_id'),
  quizId: generatePathParamUUID('quizId'),
  reportId: generatePathParamUUID('report_id'),
  roleId: generatePathParamUUID('roleId'),
  searchId: generatePathParamUUID('searchId'),
  stageId: generatePathParamUUID('stageId'),
  submissionId: generatePathParamUUID('submission_id'),
  teamId: generatePathParamUUID('teamId'),
  tenantId: generatePathParamUUID('tenantId'),
  pipelineId: generatePathParamUUID('pipelineId'),

  // custom
  domain: generatePathParam('domain', {
    type: 'string',
  }),

  integrationType: generatePathParam('type', {
    type: 'string',
    enum: ['FISERV'],
  }),
  lessonId: generatePathParam('lessonId', {
    type: 'number',
  }),
  naicsCode: generatePathParam('code', {
    type: 'string',
    pattern: '\\d+|null',
  }),
  naicsType: generatePathParam('type', {
    type: 'string',
    enum: ['rpmg', 'sp'],
  }),
  pageId: generatePathParam('pageId', {
    type: 'number',
  }),
  siteId: generatePathParam('site_id', {
    type: 'string',
  }),
  uploadId: generatePathParam('uploadId', {
    type: 'string',
  }),
  userId: generatePathParam('user_id', {
    oneOf: [
      {
        type: 'string',
        format: 'uuid',
      },
      {
        type: 'string',
        enum: ['self', 'me'],
      },
    ],
  }),
};
