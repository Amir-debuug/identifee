import { Span, SpanKind } from '@opentelemetry/api';
import {
  OT_SPAN_ID_HEADER,
  OT_TRACE_ID_HEADER,
} from '@opentelemetry/propagator-ot-trace';
import { api } from '@opentelemetry/sdk-node';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import * as Sentry from '@sentry/node';
import { Express, NextFunction, Request, Response } from 'express';
import { APIRequest } from 'lib/utils';
import { getMetrics } from './metrics';
import { getTracer, obfuscate, setError, setOK } from './tracing';

export type OtelMiddleware = {
  otel: OtelTracingMiddleware & OtelMetricsMiddleware;
};

/**
 * This should rarely be used as startActiveSpan starts child spans. The
 * few cases this is used is when parent span must be modified due to discovering
 * additional context that applies to the parent
 * e.g.: incoming request is an OpenAPI request, rename to OpenAPI operation
 */
export type OtelRootMiddleware = {
  otel: {
    telemetry: {
      rootSpan: Span;
    };
  };
} & OtelMiddleware;

/**
 * For flows that don't require rootSpan
 */
type OtelTracingMiddleware = {
  telemetry: {
    sdk: typeof api;
    sentry: typeof Sentry;
    getTracer: typeof getTracer; // starting server spans
    obfuscate: typeof obfuscate;
    setError: typeof setError;
    setOK: typeof setOK;
  };
};

type OtelMetricsMiddleware = {
  metrics: ReturnType<typeof getMetrics>;
};

export function openTelemetryMiddleware(app: Express) {
  const tracer = getTracer();
  if (!tracer) {
    throw new Error('tracer must be initialized');
  }
  const metrics = getMetrics();
  if (!metrics) {
    throw new Error('metrics must be initialized');
  }

  app.use(OpenTelemetryTracing() as any);
  app.use(OpenTelemetryMetics() as any);
}

function OpenTelemetryMetics() {
  return function openTelemetryMetrics(
    req: Request & OtelMiddleware,
    res: Response,
    next: NextFunction
  ) {
    if (!req.otel) {
      (req as any).otel = {};
    }

    req.otel.metrics = getMetrics();
    return next();
  };
}

function OpenTelemetryTracing() {
  return function openTelemetryTracing(
    req: Request & OtelRootMiddleware,
    res: Response,
    next: NextFunction
  ) {
    if (!req.otel) {
      (req as any).otel = {};
    }

    const tracer = getTracer();

    const span = api.trace.getSpan(api.context.active());
    const spanName = `${req.method} ${req.baseUrl}${req.originalUrl}`;

    if (!span) {
      return tracer.startActiveSpan(
        spanName,
        {
          attributes: {
            [SemanticAttributes.HTTP_METHOD]: req.method,
            [SemanticAttributes.HTTP_URL]: req.url,
          },
          kind: SpanKind.SERVER,
          root: true,
        },
        (span) => {
          return startRootSpan(req, spanName, span, next);
        }
      );
    }

    return startRootSpan(req, spanName, span, next);
  };
}

function startRootSpan(
  req: Request & OtelRootMiddleware,
  spanName: string,
  span: Span,
  next: NextFunction
) {
  console.info(`starting trace id: ${span.spanContext().traceId}`);
  span.updateName(spanName);
  setOK(span);
  Sentry.setContext('opentelemetry', {
    traceId: span.spanContext().traceId,
  });

  req.otel.telemetry = {
    rootSpan: span,
    ...initializeTelemetry(),
  };

  return next();
}

export function initializeOtel() {
  return {
    otel: {
      telemetry: initializeTelemetry(),
      metrics: getMetrics(),
    },
  };
}

export function initializeTelemetry() {
  return {
    sdk: api,
    sentry: Sentry,
    getTracer,
    obfuscate,
    setError,
    setOK,
  };
}

export function openTelemetryError(
  error: Error & { status?: number },
  req: OtelRootMiddleware,
  res: Response,
  next: NextFunction
) {
  req.otel.telemetry.setError(req.otel.telemetry.rootSpan, error);

  // only want to bubble up exceptions that are not caught
  if (!error.status || error.status >= 500) {
    req.otel.telemetry.sentry.captureException(error);
  }

  return next(error);
}

export function openTelemetryRequest(
  req: APIRequest & OtelRootMiddleware,
  res: Response
) {
  // this should only happen for front end requests being routed in combined
  // deployment mode
  if ((req as any).isReact) {
    return;
  }

  // drop ids from operation naming, no need
  let cleanPath = req.originalUrl.replace(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
    ':id'
  );
  cleanPath = cleanPath.replace(/(\/)\d+((\/)|$)/g, '$1:id$2');
  cleanPath = cleanPath.replace(/\?.*$/g, ''); // drop query
  req.otel.telemetry.rootSpan.setAttribute('app.http.target.parsed', cleanPath);

  const defaultTags = {
    'deployment.environment': process.env.NODE_ENV,
    app_http_target_parsed: cleanPath,
    [SemanticAttributes.HTTP_METHOD]: req.method,
    [SemanticAttributes.HTTP_SCHEME]: req.protocol,
    [SemanticAttributes.NET_HOST_IP]: res.socket?.localAddress,
    [SemanticAttributes.NET_HOST_PORT]: res.socket?.localPort,
  };
  req.otel.metrics.http.activeRequests.add(1, defaultTags);
  req.otel.metrics.http.totalRequests.add(1, defaultTags);

  const startTime = process.hrtime();
  res.on('close', () => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(startTime);
    const msDuration = (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;

    req.otel.metrics.http.serverDuration.record(msDuration, {
      ...defaultTags,
      [SemanticAttributes.HTTP_STATUS_CODE]: res.statusCode,
    });

    req.otel.metrics.http.activeRequests.add(-1, defaultTags);

    if (res.statusCode >= 400) {
      req.otel.metrics.http.totalErrors.add(1, {
        ...defaultTags,
        [SemanticAttributes.HTTP_STATUS_CODE]: res.statusCode,
      });
    }
  });

  const oldWrite = res.write;
  const oldEnd = res.end;
  const responseChunks: any[] = [];
  res.write = function (chunk) {
    responseChunks.push(chunk);
    return oldWrite.apply(res, arguments as any);
  };

  res.end = function (chunk) {
    if ((req as any).isReact) {
      return oldEnd.apply(res, arguments as any);
    }

    let body: string | null = null;
    if (Buffer.isBuffer(chunk)) {
      if (chunk) responseChunks.push(chunk);
      body = Buffer.concat(responseChunks).toString('utf8');
    } else if (typeof chunk === 'string') {
      body = chunk;
    }
    if (body) {
      try {
        const oResBody = obfuscate(JSON.parse(body));
        req.otel.telemetry.rootSpan.setAttribute(
          'app.res.body',
          JSON.stringify(oResBody)
        );
      } catch (error) {
        req.otel.telemetry.rootSpan.setAttribute('app.res.body', body);
      }
    }

    const oHeaders = obfuscate({ ...req.headers });
    const oQuery = obfuscate({ ...req.query });
    const oBody = obfuscate({ ...req.body });

    req.otel.telemetry.rootSpan.setAttributes({
      'app.req.headers': JSON.stringify(oHeaders),
      'app.req.query': JSON.stringify(oQuery),
      'app.req.body': JSON.stringify(oBody),
    });

    req.otel.telemetry.rootSpan.updateName(
      `${req.method} ${req.baseUrl}${cleanPath}`
    );

    if (!res.headersSent) {
      res.setHeader(
        OT_TRACE_ID_HEADER,
        req.otel.telemetry.rootSpan.spanContext().traceId
      );
      res.setHeader(
        OT_SPAN_ID_HEADER,
        req.otel.telemetry.rootSpan.spanContext().spanId
      );
    }

    return oldEnd.apply(res, arguments as any);
  };
}
