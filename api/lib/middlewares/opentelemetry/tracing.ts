import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  ExpressInstrumentation,
  ExpressLayerType,
} from '@opentelemetry/instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { SequelizeInstrumentation } from 'opentelemetry-instrumentation-sequelize';
import { OTTracePropagator } from '@opentelemetry/propagator-ot-trace';
import { Resource } from '@opentelemetry/resources';
import {
  AlwaysOnSampler,
  BatchSpanProcessor,
  ConsoleSpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { Span, SpanStatusCode } from '@opentelemetry/api';
import { api } from '@opentelemetry/sdk-node';
import { URLSearchParams } from 'url';

let serviceName: string = null as any;
let provider: NodeTracerProvider = null as any;

export type Tracing = {
  consoleEnabled: boolean;
  enabled: boolean;
  environment: string;
  ignorableHosts: string[];
  sentryHost?: string;
  serviceName: string;
  zipkinHost?: string;
};

export function initializeTracer(opts: Tracing) {
  if (provider) {
    return;
  }
  serviceName = opts.serviceName;

  provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: opts.environment,
      [SemanticResourceAttributes.SERVICE_NAME]: opts.serviceName,
    }),
    sampler: new AlwaysOnSampler(),
  });

  if (!opts.enabled) {
    return;
  }

  if (opts.consoleEnabled) {
    const consoleExporter = new ConsoleSpanExporter();
    provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));
  }
  if (opts.sentryHost) {
    Sentry.init({
      dsn: opts.sentryHost,
      environment: opts.environment,
      integrations: [
        new RewriteFrames({
          root: (global as any).__rootdir__,
        }),
      ],
      tracesSampleRate: 1.0,
    });
  }
  if (opts.zipkinHost) {
    const zipkinExporter = new ZipkinExporter({
      url: opts.zipkinHost,
    });
    provider.addSpanProcessor(new BatchSpanProcessor(zipkinExporter));
  }

  registerInstrumentations({
    instrumentations: [
      new ExpressInstrumentation({
        ignoreLayers: [
          (path) => {
            const validLayers = ['middleware (unless) - '];
            return !validLayers.some((layer) => path.startsWith(layer));
          },
        ],
        ignoreLayersType: [
          ExpressLayerType.ROUTER,
          ExpressLayerType.REQUEST_HANDLER,
        ],
      }),
      new HttpInstrumentation({
        applyCustomAttributesOnSpan: (span, req, res) => {
          // req.services is to skip processing our own express request
          if ('host' in req && !(req as any).services) {
            span.updateName(req.host);
          }
          if (res.statusCode && res.statusCode >= 400) {
            span.setAttributes({
              error: true,
            });
          }
        },
        startOutgoingSpanHook: (req) => {
          let pathname = req.path || '';
          if ((req as any).url) {
            pathname = (req as any).url.pathname as string;
          }
          let query = '';
          if (req.path?.includes('?')) {
            const rawQuery = req.path.split('?')[1];
            const params = new URLSearchParams(rawQuery);
            query = JSON.stringify(
              obfuscate({
                ...Object.fromEntries(params),
              })
            );
          }

          // unable to include response or request body...
          return {
            'http.query': query,
            'http.path': pathname,
            'http.headers': JSON.stringify(obfuscate({ ...req.headers })),
          };
        },

        // this should ignore requests that are made through Rest class as that's manually instrumented
        ignoreOutgoingRequestHook: (req) => {
          const isIgnorableHost = opts.ignorableHosts.some(
            (host) => req.hostname && host.includes(req.hostname)
          );
          return isIgnorableHost;
        },
        ignoreIncomingRequestHook: (req) => {
          // want to ignore health probes
          const probeEndpoints = [
            '/health',
            '/live',
            '/metrics',
            '/ready',
            '/status',
          ];
          const isProbe = probeEndpoints.some(
            (endpoint) =>
              // also ensure this isn't a path that's a base for some feature route
              req.url?.includes(endpoint) && !req.url?.includes(`${endpoint}/`)
          );
          if (isProbe) {
            return true;
          }

          // base path for api endpoints
          const isNonAPIPath = !req.url?.startsWith('/api');
          if (isNonAPIPath) {
            return true;
          }

          return false;
        },
        requireParentforOutgoingSpans: true,
      }),
      // new PgInstrumentation(),
      new SequelizeInstrumentation({
        ignoreOrphanedSpans: true,
      }) as any,
    ],
  });

  // need this for instrumentation...
  require('express');
  require('http');
  require('https');
  require('got');
  require('sequelize');
  // require('pg');

  api.propagation.setGlobalPropagator(new OTTracePropagator());
  provider.register({ propagator: new OTTracePropagator() });

  return;
}

export function getTracer() {
  return provider.getTracer(serviceName);
}

export function obfuscate(obj: any) {
  const o = JSON.parse(JSON.stringify(obj || {}));

  const keysToObfuscate = [
    'password',
    'authorization',
    'refresh_token',
    'access_token',
    'otp',
    'api-key',
  ];

  Object.entries(o).forEach(([key, value]) => {
    if (keysToObfuscate.includes(key.toLowerCase())) {
      o[key] = '***';
    }
  });

  return o;
}
export function setOK(span: Span) {
  span.setStatus({
    code: SpanStatusCode.OK,
  });
}
export function setError(span: Span, error: Error) {
  span.setStatus({
    code: SpanStatusCode.ERROR,
    // message: error.message, // writes to 'error' which we do not want..
  });

  if (!(error instanceof Error) && typeof error === 'object') {
    error = new Error(JSON.stringify(error));
  }

  span.setAttributes({
    error: true,
    'error.stack': error.stack || '',
    'error.message': error.message || '',
  });
}
