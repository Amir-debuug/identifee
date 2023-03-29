import * as fs from 'fs';
import { OpenAPIV3 } from 'openapi-types';
import { getOpenApiWriter, getTypeScriptReader, makeConverter } from 'typeconv';

(async () => {
  const dbTypesFile = fs.readFileSync(
    'lib/generators/expandedTypes.gen.ts',
    'utf-8'
  );
  const allTypes = [dbTypesFile].join('\n');

  const reader = getTypeScriptReader();
  const writer = getOpenApiWriter({
    format: 'ts',
    title: 'Model Definitions',
    version: '1.0.0',
    schemaVersion: '3.0.3',
  });
  const { convert } = makeConverter(reader, writer);
  const { data } = await convert({ data: allTypes });
  const parsedData = fixTypes(JSON.parse(data));

  const openAPIPath = 'lib/generators/openAPI.gen.json';
  fs.writeFileSync(openAPIPath, JSON.stringify(parsedData, null, 2));
})();

function fixTypes(data: {
  components: { schemas: { [K in string]: OpenAPIV3.SchemaObject } };
}) {
  // need to find and delete all titles that have $ref member
  const propertiesCorrect = (props: OpenAPIV3.SchemaObject['properties']) => {
    Object.values(props || {}).forEach((schema) => {
      schemaCorrect(schema as any);
    });
  };

  const schemaCorrect = (schema: OpenAPIV3.SchemaObject) => {
    if ('$ref' in schema && (schema as any).title) {
      delete (schema as any).title;
    }
    // causes issues with oneOf and anyOf...
    if (typeof schema.additionalProperties === 'boolean') {
      delete schema.additionalProperties;
    }
    if (Object.keys(schema).includes('additionalItems')) {
      delete (schema as any).additionalItems;
    }
    if ('description' in schema && schema.description) {
      const attrs = schema.description.split('\n');
      const descriptions = attrs
        .map((attr) => {
          const attrReg = new RegExp(/(\s)?@.*/);
          const attrMatch = attrReg.exec(attr);
          if (attrMatch) {
            const [attr, ...attrValue] = attrMatch[0].split(' ');
            const attrName = attr.replace(/@|\n/, '');

            if (attrName === 'description') {
              return attrValue.join(' ');
            }
            (schema as any)[attrName] = Number.isNaN(Number(attrValue[0]))
              ? attrValue.join(' ')
              : Number(attrValue);
            return '';
          }
          return attr;
        })
        .filter((str) => !!str);
      schema.description = descriptions.join('\n');

      if (!schema.description) {
        delete schema.description;
      }
    }

    if ('properties' in schema && schema.properties) {
      propertiesCorrect(
        schema.properties as OpenAPIV3.SchemaObject['properties']
      );
    }
    if ('anyOf' in schema && schema.anyOf) {
      schema.anyOf.forEach((schema) => {
        schemaCorrect(schema as OpenAPIV3.SchemaObject);
      });

      // this kind of type creates an improper anyOf, need to combine into single
      // 'type' | 'type2' | null
      if (schema.anyOf.length === 2) {
        const possibleInvalidProps = Object.keys(schema.anyOf[1]);
        if (
          possibleInvalidProps.includes('nullable') &&
          (possibleInvalidProps.length === 1 ||
            (possibleInvalidProps.length === 2 &&
              possibleInvalidProps.includes('title')))
        ) {
          const [type1] = schema.anyOf;
          const isNullableDate =
            '$ref' in type1 &&
            type1['$ref'].endsWith('Date') &&
            (schema.anyOf[1] as any).nullable;

          if (!isNullableDate) {
            schema.enum = (schema.anyOf[0] as any).enum;
            schema.type = (schema.anyOf[0] as any).type;
            schema.nullable = true;
            delete schema.anyOf;
          } else if (isNullableDate) {
            Object.entries(schemas.Date).forEach(([key, value]) => {
              schema[key] = value;
            });
            schema.nullable = true;
            delete schema.anyOf;
          }
        }
      }

      if (schema.anyOf) {
        // anyOf causes types to be generated with partial
        schema.oneOf = schema.anyOf;
        delete schema.anyOf;
      }
    }
    if ('allOf' in schema && schema.allOf) {
      if (schema.allOf.length === 0) {
        delete schema.allOf;
      } else {
        schema.allOf.forEach((schema) => {
          schemaCorrect(schema as OpenAPIV3.SchemaObject);
        });
      }
    }
    if ('oneOf' in schema && schema.oneOf) {
      schema.oneOf.forEach((schema) => {
        if ('title' in schema) {
          delete schema.title;
        }
        schemaCorrect(schema as OpenAPIV3.SchemaObject);
      });
    }
    if ('items' in schema && schema.items) {
      if (!Array.isArray(schema.items)) {
        schemaCorrect(schema.items as any);
      } else {
        schema.items.forEach((item) => {
          schemaCorrect(item);
        });
      }
    }

    /**
     * Special cases
     */
    if ('oneOf' in schema && schema.oneOf) {
      // can't have minItems = 0, invalid :(
      const idxs = schema.oneOf
        .filter(
          (oneOf) =>
            (oneOf as any).minItems === 0 &&
            schema.title !== 'AnalyticTimeDimension' // skip time dimension
        )
        .map((oneOf, idx) => idx);
      idxs.forEach((idx, i) => {
        schema.oneOf?.splice(idx - i, 1);
      });
    }
  };

  const joinSchemas = (
    parent: OpenAPIV3.SchemaObject,
    childSchemas: (
      | {
          name: string;
          property: string;
          type: 'object' | 'array';
          required: boolean;
          schema?: OpenAPIV3.SchemaObject;
        }
      | OpenAPIV3.SchemaObject
    )[]
  ) => {
    let joined = JSON.parse(JSON.stringify(parent));

    if (!joined.allOf) {
      joined = {
        allOf: [
          {
            ...joined,
          },
        ],
      };
    }

    childSchemas.forEach((child) => {
      let schema;
      // raw schema
      if ('name' in child) {
        const innerSchema = child.schema
          ? child.schema
          : {
              $ref: `#/components/schemas/${child.name}`,
            };

        if (child.type === 'object') {
          schema = {
            type: 'object',
            properties: {
              [child.property]: innerSchema,
            },
          };
        } else if (child.type === 'array') {
          schema = {
            type: 'object',
            properties: {
              [child.property]: {
                type: 'array',
                items: innerSchema,
              },
            },
          };
        }

        if (schema && child.required) {
          (schema as any).required = [child.property];
        }
      }
      if ('properties' in child) {
        schema = child;
      }

      if (schema) {
        joined.allOf!.push(schema);
      }
    });

    return joined as OpenAPIV3.SchemaObject;
  };

  const schemas = data.components.schemas;

  /**
   * The following is to fix types that are not properly converted from
   * typescript (typeconv) to OpenAPI schema. This mainly occurs when using
   * type util functions or generics with types.
   */

  (schemas.AnalyticDateRange as any).anyOf[1].maxItems = 2;
  (schemas.AnalyticDateRange as any).anyOf[1].items = {
    ...(schemas.AnalyticDateRange as any).anyOf[1].items[0],
    format: 'date-time',
  };

  (schemas.AnalyticOrder as any).items.maxItems = 2;

  const AnalyticRelativeTimeRange = {
    ...(schemas.AnalyticRelativeTimeRange as any),
  };
  (schemas.AnalyticRelativeTimeRange as any) = {
    title: 'AnalyticRelativeTimeRange',
    oneOf: [
      { ...AnalyticRelativeTimeRange },
      {
        type: 'string',
        pattern: 'last \\d+ (day|month|year)',
      },
      {
        type: 'string',
        pattern: 'from \\d+ (day|month|year) ago to now',
      },
    ],
  };

  (schemas.AnalyticTimeDimension as any).anyOf[0].items = {
    type: 'string',
  };
  (schemas.AnalyticTimeDimension as any).anyOf[0].maxItems = 0;
  (schemas.AnalyticTimeDimension as any).anyOf[0].description =
    'This is meant to represent an empty array as time dimensions are tuples.';

  (schemas.AnalyticTimeDimension as any).anyOf[1].minItems = 1;
  (schemas.AnalyticTimeDimension as any).anyOf[1].maxItems = 1;
  (schemas.AnalyticTimeDimension as any).anyOf[1].items = {
    ...(schemas.AnalyticTimeDimension as any).anyOf[1].items[0],
  };

  (schemas.AnalyticTimeDimension as any).anyOf[2].minItems = 1;
  (schemas.AnalyticTimeDimension as any).anyOf[2].maxItems = 1;
  (schemas.AnalyticTimeDimension as any).anyOf[2].items = {
    ...(schemas.AnalyticTimeDimension as any).anyOf[2].items[0],
  };

  (schemas.AnalyticCompareDateRange as any).anyOf[0].maxItems = 1;
  (schemas.AnalyticCompareDateRange as any).anyOf[0].items = {
    ...(schemas.AnalyticCompareDateRange as any).anyOf[0].items[0],
  };
  (schemas.AnalyticCompareDateRange as any).anyOf[1].maxItems = 2;
  (schemas.AnalyticCompareDateRange as any).anyOf[1].items = {
    ...(schemas.AnalyticCompareDateRange as any).anyOf[1].items[0],
  };

  (schemas.Date as any) = {
    type: 'string',
    format: 'date-time',
    description: 'ISO date time',
    example: '2006-01-02T15:04:05.000Z',
  };

  (schemas.Order as any).maxItems = 2;

  /**
   * The following modifications are for route specific queries, payloads,
   * and/or responses.
   *
   * Please use format of:
   * * <operationId> for response
   * * <operationIdQuery> for queries
   * * <operationIdPayload> for payloads
   */

  // only kept around because it doesn't use standard format of `data`
  schemas.GetUsers = joinSchemas(schemas.UserAttr, [
    {
      name: 'TenantAttr',
      property: 'tenant',
      type: 'object',
      required: true,
    },
    {
      name: 'RoleAttr',
      property: 'role',
      type: 'object',
      required: false,
    },
  ]);

  Object.values(data.components.schemas).forEach((schema) => {
    schemaCorrect(schema as OpenAPIV3.SchemaObject);
  });

  // want to keep anyOf here
  delete (schemas.DashboardDefaultBiz as any).properties;
  delete (schemas.DashboardDefaultBiz as any).required;
  delete (schemas.DashboardDefaultBiz as any).type;
  (schemas.DashboardDefaultBiz as any).anyOf = [
    {
      properties: {
        type: {
          title: 'DashboardDefaultBiz.types',
          enum: ['insight'],
          type: 'string',
        },
        organizationId: {
          title: 'DashboardDefaultBiz.organizationId',
          type: 'string',
        },
      },
      required: ['type', 'organizationId'],
      type: 'object',
    },
    {
      properties: {
        type: {
          title: 'DashboardDefaultBiz.type',
          enum: ['dashboard'],
          type: 'string',
        },
      },
      required: ['type'],
      type: 'object',
    },
  ];

  return data;
}
