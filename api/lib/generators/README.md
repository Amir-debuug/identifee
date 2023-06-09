# generators

Typescript types and OpenAPI generation.

## General Info

The following will go over the three phases that are needed before we build our application. It will also go over why this is needed in the first place and the problem that is being solved.

Three phases:

1. expandTypes
2. openAPI
3. operations

### What is it?

As this service is using Typescript, it allows to create types from everything including our database models, our API responses, our API inputs, and any additional types our service uses.

In short, these generators are taking our types and creating OpenAPI documentation automatically. And the added benefit is that developers must adhere to the documentation, otherwise build will throw an error.

The build phases convert our definitions from complex types using type utility functions such as `Omit<>` into the expanded typescript type, it also takes those types and converts into OpenAPI schemas, and then converts those OpenAPI schemas into a type file.

## Code Walkthrough

Before continuing:

* DB Table type - this is the type that defines the complete table stored in our database
* DAO type - these types are used in our DAO layer and contain attributes such as `user_id` and `tenant_id` which must be provided by Biz layer, not as an API input.
* Biz type - these types are used in our Biz layer and will typically be identical to the API input and/or response.

For the following sections, we will be referencing the following example DB file code which contains types for our table model, DAO create types, and Biz create types.

```ts
type MyModelAttr = {
  /**
   * @type uuid
   */
  id: string; // id is auto generated by database

  /**
   * @format uuid
   */
  tenantId: string; // tenant id should only be required on create

  /**
   * @type uuid
   */
  name: string; // required by db. Does not have a default value and is not generated

  description?: string | null; // indicates a nullable column

  /**
   * @type uuid
   */
  enabled?: boolean; // indicates `enabled` has a default value

  deletedAt?: Date | null;
}

type MyModelCreateDAO = ExpandRecursively<
  ToCreateType<MyModelAttr, 'id' | 'deletedAt', 'enabled'>
>;
type MyModelModifyDAO = ToModifyType<MyModelCreateDAO, 'tenantId'>;

type MyModelCreateBiz = Omit<
  MyModelCreateDAO,
  'tenantId'
>;
type MyModelModifyBiz = MyModelModifyDAO;
```

The example contains the typical type declaration for a DB file. But let's go through a brief overview of each type:

```ts
// This type creates the DAO creation model.
// `id` and `deleted` is managed by the DAO layer. `id` is auto generated by
// the database and `deleted` is managed by DAO as only the DAO should know about deleting.
// `enabled` means the column has a default value.
type MyModelCreateDAO = ExpandRecursively<
  ToCreateType<MyModelAttr, 'id' | 'deletedAt', 'enabled'>
>;

// Typescript will infer a type like this:
type InferredType = {
  tenantId: string;
  name: string;
  description?: string | null | undefined;
};
```

```ts
// This type creates the DAO modify model.
// `tenantId` will no longer be allowed as it should not be modified after creation.
// The type will also allow all other fields to be optional as modification does not require the complete payload.
type MyModelModifyDAO = ToModifyType<MyModelCreateDAO, 'tenantId'>;

// Typescript will infer a type like this:
type InferredType = {
  name?: string | undefined;
  description?: string | null | undefined;
};
```

```ts
// This type creates the Biz creation model.
// `tenantId`should not be allowed by the API.
type MyModelCreateBiz = Omit<
  MyModelCreateDAO,
  'tenantId'
>;

// Typescript will infer a type like this:
type InferredType = {
  name: string;
  description?: string | null | undefined;
};
```

### expandTypes

The first step in the build process is to "expand" each of our types. If you notice, `MyModelCreateDAO` will be shown as this (without `ExpandRecursively`):

```ts
type MyModelCreateDAO = {} & {
    tenantId: string;
    name: string;
    description?: string | null | undefined;
} & Omit<Pick<MyModelAttr, "enabled">, "enabled"> & Partial<Pick<Pick<MyModelAttr, "enabled">, "enabled">>
```

This is the type that typescript sees and for our purposes, it's unsuitable and we must expand the type using `ExpandRecursively` and our `expandTypes.ts` script.

In short, the only purpose of the script is to "execute" the type functions such as Omit, Pick, etc. to give us the complete type like this:

```ts
type MyModelCreateDAO = {
  tenantId: string;
  name: string;
  description?: string | null | undefined;
};
```

There is also one more benefit. Suppose we have our `MyModelBiz` class like this:

```ts
class MyModelBiz extends Biz {
  async create() {
    const myModel = this.services.dao.myModel.create(...);

    return {
      ...myModel,
      foo: 'bar',
      examples: [
        {
          foo: 'bar',
        }
      ]
    }
  }
}
```

As you can see, we created a `myModel` using the DAO but our Biz layer is now returning some additional stuff. This is one of those situations where our types cannot typically help us or it would require additional overhead to manage this function return type. In this situation, `expandTypes` also helps by creating Biz layer return types.

If you take a look at `expandedTypes.gen.ts`, you will see the types are also defined in this format:

```ts
export type MyModelBiz<method> = { ... };

// This is for the Create example.
export type MyModelBizCreate = { ...MyModelAttr; foo: string; examples: { foo: string }[] };
```

### openAPI

The second step is to take all the expanded types and generate OpenAPI schemas. These schemas are what we use in our route declaration and is what helps us define documentation for other users to know what we expect in our API.

For examples, please refer to `openAPI.gen.json` after executing `npm run build:openAPI`.

From these JSON OpenAPI models, we can now refer to them in our route declaration as in this example:

```ts
export const POST = operationMiddleware(
  'createMyModel',
  {
    operationId: 'createMyModel',
    summary: 'Create My Model',
    tags: ['mymodel'],
    security: [{ Bearer: [] }],
    requestBody: generateRequestBody(apiSchemas.MyModelCreateBiz),
    responses: {
      200: generateResponseSchema(apiSchemas.MyModelAttr),
    },
  },

  async (req, res) => {}
);
```

This line is enforcing the request body from the type we created as `MyModelCreateBiz`. And it's OpenAPI compatible without the need for us to manually maintain the JSON schema.

```ts
    requestBody: generateRequestBody(apiSchemas.MyModelCreateBiz),
```

This line is enforce the response. Our API requests typically return the database model in the response so not much going on.

```ts
      200: generateResponseSchema(apiSchemas.MyModelAttr),
```

However, there may be a complex scenario where our Biz layer returns a complex type on creation. For that situation, we can rely on the previously mentioned `MyModelBiz<method>` types that are generated from Biz layer return types.

```ts
      200: generateResponseSchema(apiSchemas.MyModelBizCreate),
```

### operations

And finally, the third step is to generate a new `operations.gen.ts` file which contains additional typescript types using the OpenAPI specification.

A small snippet:

```ts
export interface paths {
  "/users": {
    get: operations["getUsers"];
    parameters: {};
  };
}

export interface operations {
  getUsers: {
    parameters: {
      query: {...};
    };
    responses: {
      /** Successful Response */
      200: {
        content: {
          "application/json": {
            ...UsersAttr
          };
        };
      };
      /** Bad request */
      400: {
        content: {
          "application/json": {
            ...
          };
        };
      };
      /** Unauthenticated */
      401: {
        content: {
          "application/json": {
            ....
          };
        };
      };
    };
  };
```

This file is what allows us to ensure developers are returning and using the expected types as defined by our OpenAPI specification. In this example, we are saying our 200 response will return a `UsersAttr` model through `await res.success()`. If the developer does not return the appropriate type, build will throw an error.

This is easier said than done and the actual type can be found [here](api/lib/utils/operation/types.ts).
