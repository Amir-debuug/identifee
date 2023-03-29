import { Express, NextFunction, Request, Response } from 'express';
import { initialize } from 'express-openapi';
import { OpenAPIV3 } from 'openapi-types';
import { OpenAPIMiddleware } from './types';
import { authorizationHandler, securityFilter } from './authn';
import { apiSchemas } from 'lib/generators';

export function openAPIDocsUIMiddleware(app: Express, apiPath: string) {
  app.get(`${apiPath}/docs`, (req, res) => {
    return res.send(`
      <!doctype html> <!-- Important: must specify -->
      <html>
        <head>
          <meta charset="utf-8"> <!-- Important: rapi-doc uses utf8 characters -->
          <script type="module" src="https://unpkg.com/rapidoc/dist/rapidoc-min.js"></script>

          <link rel="icon" href="https://my.identifee.com/favicon.ico" id="favicon" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&family=Material+Icons+Outlined&family=Material+Icons&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <rapi-doc
            spec-url = "${apiPath}/swagger.json"

            theme = "light"
            bg-color = "#e7eaf3b3"
            text-color = "#1e2022"
            header-color = "#e7eaf3b3"
            primary-color = "#092ace"
            regular-font = "Segoe UI"

            nav-bg-color = "#e7eaf3b3"
            nav-text-color = "#1e2022"

            render-style = "focused"

            show-header = "false"
            allow-server-selection = "false"

            schema-description-expanded = true

            default-schema-tab = "schema"
          >
            <img
              slot="nav-logo"
              src="https://my.identifee.com/img/logo.svg"
            />
          </rapi-doc>
        </body>
      </html>      
    `);
  });
  // app.get(`${apiPath}/docs/redoc`, (req, res) => {
  //   return res.send(`
  //     <!DOCTYPE html>
  //     <html>
  //       <head>
  //         <title>Redoc</title>
  //         <meta charset="utf-8" />
  //         <meta name="viewport" content="width=device-width, initial-scale=1" />
  //         <link
  //           href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700"
  //           rel="stylesheet"
  //         />
  //         <style>
  //           body {
  //             margin: 0;
  //             padding: 0;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <redoc spec-url="/api/swagger.json"></redoc>
  //         <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  //       </body>
  //     </html>
  //   `);
  // });
}

/**
 * Generates the OpenAPI schema
 */
export function openAPIMiddleware(
  app: Express,
  apiPath: string,
  pkg: { name: string; version: string; description: string },
  opts: {
    enableGlob?: boolean;
    exposeAPIDocs?: boolean;
    exposeAPIDocsUI?: boolean;
  }
) {
  app.use(OpenAPI as any);

  const docs = initialize({
    app,
    apiDoc: {
      ...baseSchema(apiPath, pkg),
    },
    docsPath: '/swagger.json',
    exposeApiDocs: opts.exposeAPIDocs,
    paths: `${__dirname}/../../routes`,
    // pathSecurity: [[/./, [{ Bearer: [] }]]],
    promiseMode: true,
    securityFilter: securityFilter as any,
    securityHandlers: {
      Bearer: authorizationHandler as any,
      Basic: authorizationHandler as any,
    },

    ...(opts.enableGlob
      ? {
          routesGlob: '**/*.{ts,js}',
          routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
        }
      : {}), // don't enable unless using ts-node
  });

  if (opts.exposeAPIDocsUI) {
    openAPIDocsUIMiddleware(app, apiPath);
  }

  return docs;
}

/**
 * Returns the base schema to be used to initialize OpenAPI express.
 */
function baseSchema(
  apiPath: string,
  pkg: { name: string; version: string; description: string }
): OpenAPIV3.Document {
  return {
    openapi: '3.0.3',
    info: {
      title: pkg.name,
      version: pkg.version,
      description: pkg.description,
    },
    paths: {},
    tags: [],
    security: [{ Bearer: [] }],
    components: {
      schemas: apiSchemas,
      securitySchemes: {
        Bearer: {
          type: 'http',
          description: 'Bearer <JWT>',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        Basic: {
          type: 'http',
          description: 'Basic <username>:<password>',
          scheme: 'basic',
        },
      },
    },
    servers: [
      {
        url: apiPath,
      },
    ],
  };
}

export function OpenAPI(
  req: Request & OpenAPIMiddleware,
  res: Response,
  next: NextFunction
) {
  req.openAPI = {
    getPath: (operationId: string) => {
      if (!req.operationDoc) {
        return;
      }
      const [path] =
        Object.entries(req.apiDoc.paths).find(([path, methods]) => {
          return Object.entries(methods || {}).some(([method, operation]) => {
            if (!operation || typeof operation === 'string') {
              return false;
            }
            if ('responses' in operation) {
              return operationId === operation.operationId;
            }
            return false;
          });
        }) || [];

      return path;
    },
  };

  return next();
}
