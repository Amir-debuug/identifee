import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { NextFunction } from 'express';
import { OpenAPIDoc } from 'lib/middlewares/openapi';
import { operations } from 'lib/generators/operations.gen';
import { APIRequest, APIResponse } from './types';
import { OtelRootMiddleware } from 'lib/middlewares/opentelemetry';

export type ControllerFn<T extends keyof operations> = (
  req: APIRequest<T>,
  res: APIResponse<T>,
  next: NextFunction
) => void;

/**
 * Provides type enforcement upon an Express handler
 *
 * We use a type enforcer since VSCode does not provide suggestions if we pass
 * in the type through generic argument...
 */
function operation<T extends keyof operations>(
  type: T, // this is how we allow vscode to provide suggestions...
  controller: ControllerFn<T>
) {
  return (async (req: APIRequest & OtelRootMiddleware, res: any, next: any) => {
    const path = req.openAPI.getPath(req.operationDoc.operationId);
    if (path) {
      req.otel.telemetry.rootSpan.setAttribute('app.openapi.path', path);
    }
    req.otel.telemetry.rootSpan.setAttribute(
      'app.openapi.operation',
      req.operationDoc.operationId
    );

    return req.otel.telemetry.getTracer().startActiveSpan(
      `OpenAPI - ${req.operationDoc.operationId}`,
      {
        kind: req.otel.telemetry.sdk.SpanKind.INTERNAL,
      },
      async (span) => {
        req.otel.telemetry.setOK(span);

        try {
          await controller(req as any, res, next);

          span.setAttributes({
            [SemanticAttributes.HTTP_STATUS_CODE]: res.statusCode,
          });
        } catch (error: any) {
          req.otel.telemetry.setError(span, error);
          return next(error);
        } finally {
          span.end();
        }
      }
    );
  }) as {
    (req: any, res: any, next?: NextFunction): any;
    apiDoc?: OpenAPIDoc;
  };
}

/**
 * This allows us to create OpenAPI operations with middlewares.
 *
 * The order of execution is from first to last in args. The last controller
 * will be the one that has apiDoc attached to.
 */
export function operationMiddleware<T extends keyof operations>(
  type: T, // this is how we allow vscode to provide suggestions...
  apiDoc: OpenAPIDoc & { operationId: T },
  ...controllers: [ControllerFn<T>, ...ControllerFn<T>[]]
) {
  // the last controller should be the handler
  const controller = controllers.pop();

  const operationController = operation(type, controller as ControllerFn<T>);
  operationController.apiDoc = apiDoc;

  return [...controllers, operationController];
}
