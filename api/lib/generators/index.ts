import { OpenAPIV3 } from 'openapi-types';
import openapi from './openAPI.gen.json';

const {
  components: { schemas },
} = openapi;
export const apiSchemas = { ...schemas } as unknown as {
  [K in keyof typeof schemas]: OpenAPIV3.SchemaObject;
};
