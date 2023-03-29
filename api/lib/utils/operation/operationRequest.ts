import { Response } from 'express';
import { OtelRootMiddleware } from 'lib/middlewares/opentelemetry';
import { APIRequest } from './types';

export function operationRequest(
  req: APIRequest & OtelRootMiddleware,
  res: Response
) {
  const endOperation = (
    req: APIRequest & OtelRootMiddleware,
    res: Response
  ) => {
    // this should only happen for front end requests being routed in combined
    // deployment mode
    if ((req as any).isReact) {
      return;
    }

    const isOpenAPIOperation =
      !!req.operationDoc && !!req.operationDoc.operationId;

    console.info(
      `ending trace id: ${req.otel.telemetry.rootSpan.spanContext().traceId}`
    );
    if (!isOpenAPIOperation) {
      req.otel.telemetry.rootSpan.end();
      return;
    }

    const path = req.openAPI.getPath(req.operationDoc.operationId);
    if (path) {
      req.otel.telemetry.rootSpan.setAttribute('openapi.path', path);
    }
    req.otel.telemetry.rootSpan.setAttribute(
      'openapi.operation',
      req.operationDoc.operationId
    );
    req.otel.telemetry.rootSpan.end();
  };

  res.once('close', endOperation.bind(null, req, res));
  res.once('error', endOperation.bind(null, req, res));
}
