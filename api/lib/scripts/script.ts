import * as dotenv from 'dotenv';
import path from 'path';
// load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { Span } from '@opentelemetry/api';
import {
  getTracer,
  initializeObservability,
  initializeOtel,
  OtelMiddleware,
} from '../middlewares/opentelemetry';
import { sequelizeInit } from '../middlewares/sequelize';

const pkg = require('../../package.json');

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_DATABASE = 'idf',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = '',
  DB_SYNC,

  METRICS_ENABLE,
  METRICS_OTLP_HOST = '',

  NODE_ENV = 'production',

  TRACING_ENABLE,
  TRACING_ENABLE_CONSOLE,
  TRACING_SENTRY_DSN = '',
  TRACING_ZIPKIN_HOST = '',
} = process.env;

export async function startSequelize(context: OtelMiddleware) {
  return sequelizeInit(context, {
    host: DB_HOST,
    port: Number(DB_PORT),
    database: DB_DATABASE,
    schema: 'public',
    username: DB_USERNAME,
    password: DB_PASSWORD,
    sync: DB_SYNC === 'true',
  });
}

export async function run(
  fn: (context: OtelMiddleware, span: Span) => Promise<void>
) {
  initializeObservability({
    metrics: {
      enabled: METRICS_ENABLE === 'true',
      environment: NODE_ENV,
      serviceName: pkg.name.replace(/\/|\-/g, '_').replace('@', ''),
      otlpHost: METRICS_OTLP_HOST,
    },
    tracing: {
      enabled: TRACING_ENABLE === 'true',
      environment: NODE_ENV,
      consoleEnabled: TRACING_ENABLE_CONSOLE === 'true',
      ignorableHosts: [TRACING_SENTRY_DSN, TRACING_ZIPKIN_HOST],
      sentryHost: TRACING_SENTRY_DSN,
      serviceName: pkg.name.replace(/\/|\-/g, '_').replace('@', ''),
      zipkinHost: TRACING_ZIPKIN_HOST,
    },
  });
  const context = initializeOtel();

  const tracer = getTracer();
  await tracer.startActiveSpan('script', async (span) => {
    console.log('boot up...');
    console.log(`traceid: ${span.spanContext().traceId}`);

    await fn(context, span);

    span.end();
    console.log('finished script...');
    process.exit(0);
  });
}
