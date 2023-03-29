import {
  Attributes,
  Counter,
  Histogram,
  UpDownCounter,
} from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { Resource } from '@opentelemetry/resources';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

let metrics: {
  http: {
    activeRequests: UpDownCounter<Attributes>;
    clientDuration: Histogram<Attributes>;
    serverDuration: Histogram<Attributes>;
    totalErrors: Counter<Attributes>;
    totalRequests: Counter<Attributes>;
  };
} = null as any;

export type Metrics = {
  enabled: boolean;
  environment: string;
  otlpHost?: string;
  serviceName: string;
};

export function initializeMetrics(opts: Metrics) {
  if (metrics) {
    return;
  }

  const provider = new MeterProvider({
    resource: new Resource({
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: opts.environment,
      [SemanticResourceAttributes.SERVICE_NAME]: opts.serviceName,
    }),
  });

  if (opts.otlpHost) {
    const exporter = new OTLPMetricExporter({
      url: opts.otlpHost,
      headers: {},
      concurrencyLimit: 10,
    });

    provider.addMetricReader(
      new PeriodicExportingMetricReader({
        exporter,
        exportIntervalMillis: 1000,
      })
    );
  }

  const meter = provider.getMeter(opts.serviceName);

  // https://opentelemetry.io/docs/reference/specification/metrics/semantic_conventions/http-metrics/
  metrics = {
    http: {
      activeRequests: meter.createUpDownCounter('http_server_active_requests', {
        description:
          'Measures the number of concurrent HTTP requests that are currently in-flight.',
      }),
      clientDuration: meter.createHistogram('http_client_duration', {
        description: 'Measures the duration of outbound HTTP requests.',
      }),
      serverDuration: meter.createHistogram('http_server_duration', {
        description: 'Measures the duration of inbound HTTP requests.',
      }),
      totalErrors: meter.createCounter('http_server_total_errors', {
        description: 'Measures the total number of HTTP errors.',
      }),
      totalRequests: meter.createCounter('http_server_total_requests', {
        description: 'Measures the total number of inbound HTTP requests.',
      }),
    },
  };

  // need to be initialized to 0..
  metrics.http.activeRequests.add(0, {});
  metrics.http.clientDuration.record(0, {});
  metrics.http.serverDuration.record(0, {});
  metrics.http.totalErrors.add(0, {});
  metrics.http.totalRequests.add(0, {});
}

export function getMetrics() {
  return metrics;
}
