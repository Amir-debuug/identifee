import { ErrorRequestHandler, Request, RequestHandler } from 'express';
import { OtelMiddleware, setError, setOK } from 'lib/middlewares/opentelemetry';

/**
 * Handles promises in routes and route errors accordingly
 */
function asyncHandler(handler: RequestHandler): RequestHandler;
function asyncHandler(handler: ErrorRequestHandler): ErrorRequestHandler;
function asyncHandler(
  handler: RequestHandler | ErrorRequestHandler
): RequestHandler | ErrorRequestHandler {
  if (handler.length === 2 || handler.length === 3) {
    const scoped: RequestHandler = (req, res, next) => {
      const newReq = req as Request & OtelMiddleware;
      return newReq.otel.telemetry.getTracer().startActiveSpan(
        `AsyncHandler - ${req.originalUrl}`,
        {
          kind: newReq.otel.telemetry.sdk.SpanKind.INTERNAL,
        },
        async (span) => {
          setOK(span);

          return Promise.resolve((handler as RequestHandler)(req, res, next))
            .catch((error) => {
              setError(span, error);
              return next(error);
            })
            .finally(() => span.end());
        }
      );
    };
    return scoped;
  } else if (handler.length === 4) {
    const scoped: ErrorRequestHandler = (err, req, res, next) => {
      const newReq = req as Request & OtelMiddleware;
      return newReq.otel.telemetry.getTracer().startActiveSpan(
        `AsyncHandler - ${req.originalUrl}`,
        {
          kind: newReq.otel.telemetry.sdk.SpanKind.INTERNAL,
        },
        async (span) => {
          setOK(span);

          return Promise.resolve(
            (handler as ErrorRequestHandler)(err, req, res, next)
          )
            .catch((error) => {
              setError(span, error);
              return next(error);
            })
            .finally(() => span.end());
        }
      );
    };
    return scoped;
  } else {
    throw new Error(`Failed to asyncHandle() function "${handler.name}"`);
  }
}

export default asyncHandler;
