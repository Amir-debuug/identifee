import { initializeMetrics, Metrics } from './metrics';
import { initializeTracer, Tracing } from './tracing';

export function initializeObservability(opts: {
  metrics: Metrics;
  tracing: Tracing;
}) {
  initializeTracer(opts.tracing);
  initializeMetrics(opts.metrics);
}
