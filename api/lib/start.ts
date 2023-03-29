import 'module-alias/register';
// needed for sentry
(global as any).__rootdir__ = __dirname || process.cwd();

import { SpanKind } from '@opentelemetry/api';
import * as dotenv from 'dotenv';
import path from 'path';

// load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// these are required to be imported AFTER dotenv is loaded
import {
  initializeObservability,
  initializeOtel,
  setError,
  setOK,
} from './middlewares/opentelemetry';

const pkg = require('../package.json');

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_DATABASE = 'idf',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = '',
  DB_SYNC,

  EMAIL_FROM,
  EMAIL_TRANSPORT,
  EMAIL_MAILGUN_API_KEY,
  EMAIL_MAILGUN_DOMAIN,
  EMAIL_SENDMAIL_NEW_LINE,
  EMAIL_SENDMAIL_PATH,
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_USER,
  EMAIL_SMTP_PASSWORD,
  EMAIL_SMTP_POOL,
  EMAIL_SMTP_SECURE = 'true',

  METRICS_ENABLE,
  METRICS_OTLP_HOST = '',

  TRACING_ENABLE,
  TRACING_ENABLE_CONSOLE,
  TRACING_SENTRY_DSN = '',
  TRACING_ZIPKIN_HOST = '',

  PORT = '8080',
  NODE_ENV = 'production',
  PROVIDER_FISERV_HOST_NAME = '',
} = process.env;

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
    ignorableHosts: [
      PROVIDER_FISERV_HOST_NAME,
      TRACING_SENTRY_DSN,
      TRACING_ZIPKIN_HOST,
    ],
    sentryHost: TRACING_SENTRY_DSN,
    serviceName: pkg.name.replace(/\/|\-/g, '_').replace('@', ''),
    zipkinHost: TRACING_ZIPKIN_HOST,
  },
});

import { sequelizeInit } from './middlewares/sequelize';
import * as database from './database';
import * as storage from './storage';
import { createServer } from './server';
import { Email } from './providers';

if (require.main === module) {
  start();
}

async function start(): Promise<void> {
  const context = initializeOtel();

  return context.otel.telemetry
    .getTracer()
    .startActiveSpan(
      'bootup',
      { kind: SpanKind.INTERNAL },
      async (bootUpSpan) => {
        console.log(
          `starting bootup span: ${bootUpSpan.spanContext().traceId}`
        );
        bootUpSpan.addEvent('opentelemetry initialized, beginning boot up');

        let server;
        try {
          storage.init();

          await Promise.all([
            Email.init(
              context,
              {
                transport: EMAIL_TRANSPORT as any,
                sendmail: {
                  newline: EMAIL_SENDMAIL_NEW_LINE,
                  path: EMAIL_SENDMAIL_PATH,
                },
                smtp: {
                  host: EMAIL_SMTP_HOST,
                  port: Number(EMAIL_SMTP_PORT),
                  pool: EMAIL_SMTP_POOL,
                  secure: EMAIL_SMTP_SECURE === 'true',
                  user: EMAIL_SMTP_USER,
                  pass: EMAIL_SMTP_PASSWORD,
                },
                mailgun: {
                  key: EMAIL_MAILGUN_API_KEY,
                  domain: EMAIL_MAILGUN_DOMAIN,
                },
              },
              {
                from: EMAIL_FROM as string,
              }
            ),
            database.init(context),
            sequelizeInit(context, {
              host: DB_HOST,
              port: Number(DB_PORT),
              database: DB_DATABASE,
              schema: 'public',
              username: DB_USERNAME,
              password: DB_PASSWORD,
              sync: DB_SYNC === 'true',
            }),
          ]);

          server = await createServer();
          // todo revisit this...
          require('./middlewares/emitter/tasks/notifier');
        } catch (error) {
          setError(bootUpSpan, error);
          bootUpSpan.end();

          // add a buffer to upload span
          await new Promise((resolve) => setTimeout(resolve, 3000));
          throw error;
        }

        const port = Number(PORT);
        server
          .listen(port, () => {
            console.log(`Server started at port ${port}`);

            setOK(bootUpSpan);
            bootUpSpan.addEvent(`Server started at port ${port}`);
            bootUpSpan.end();
          })
          .once('error', async (err: any) => {
            setError(bootUpSpan, err);

            if (err?.code === 'EADDRINUSE') {
              bootUpSpan.addEvent(`Port ${port} is already in use`);
              bootUpSpan.end();

              process.exit(1);
            }
            bootUpSpan.end();

            // add a buffer to upload span
            await new Promise((resolve) => setTimeout(resolve, 3000));
            throw err;
          });
      }
    );
}
