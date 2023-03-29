import { Request, RequestHandler } from 'express';
import { ExpressRequestFn } from 'lib/types/express';
import { OtelMiddleware } from './opentelemetry';

/**
 * Run middleware except on provided route(s)
 *
 * TODO find a better way, this feels odd.. (regex method is way is too messy)
 */
export function unlessMiddleware(
  middleware: ExpressRequestFn,
  ...paths: string[]
) {
  return async function unless(req, res, next) {
    if (
      paths.includes(req.path) || // equality check for base route
      paths.some((path) => req.path.startsWith(`${path}/`)) // in case base route extends
    ) {
      return next();
    } else {
      const newReq = req as Request & OtelMiddleware;

      let mwError;
      // unable to set middleware - unless as parent span..
      await newReq.otel.telemetry.getTracer().startActiveSpan(
        `middleware (unless) - ${middleware.name}`,
        {
          kind: newReq.otel.telemetry.sdk.SpanKind.INTERNAL,
        },
        async (span) => {
          newReq.otel.telemetry.setOK(span);

          try {
            await middleware(req as any, res, (error) => {
              if (error) {
                newReq.otel.telemetry.setError(span, error);
              }

              mwError = error;
            });
          } catch (error: any) {
            newReq.otel.telemetry.setError(span, error);
            mwError = error;
          } finally {
            span.end();
          }
        }
      );
      return next(mwError);
    }
  } as RequestHandler;
}
