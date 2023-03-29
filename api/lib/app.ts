import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import expressLogger from 'express-pino-logger';
import fs from 'fs';
import path from 'path';
import qs from 'qs';
import { URL } from 'url';

import logger from './logger';

// middlewares
import { authenticateMiddleware } from './middlewares/auth';
import { servicesMiddleware } from './middlewares/context';
import { initCubejs } from './middlewares/cubejs';
import errorHandler from './middlewares/error-handler';
import {
  ExceptionWrapper,
  RequestEntityTooLarge,
} from './middlewares/exception';
import {
  openAPIErrorMiddleware,
  openAPIMiddleware,
} from './middlewares/openapi';
import {
  openTelemetryError,
  openTelemetryMiddleware,
} from './middlewares/opentelemetry';
import { responseMiddleware } from './middlewares/response';
import { unlessMiddleware } from './middlewares/unless';
import { emitterMiddleware } from './middlewares/emitter';

//controllers
import reports from './controllers/report';
import authController from './controllers/auth';
import users from './controllers/users';
import assets from './controllers/assets';
import files from './controllers/files';
import feed from './controllers/feed';
import contact from './controllers/contacts';
import courses from './controllers/courses';
import deals from './controllers/deals';
import products from './controllers/products';
import search from './controllers/search';
import relatedOrganization from './controllers/relatedOrganization';
import activityContacts from './controllers/activity';
import { TenantService } from './services/tenant';
import { sequelizeMiddleware } from './middlewares/sequelize';

const pkg = require('../package.json');

const {
  NODE_ENV,

  API_MAX_PAYLOAD_SIZE = '3000kb',
  API_DEPLOYMENT_TYPE = 'COMBINED',

  DB_HOST = 'localhost',
  DB_DATABASE = 'idf',
  DB_USERNAME = 'postgres',
  DB_PASSWORD = '',

  ALLOWED_ORIGINS = '*',
  API_DOCS,
  BASIC_USER,
  BASIC_PASSWORD,
  OPENAPI_TS,
  PUBLIC_URL,
  REACT_APP_CLIENT_PORTAL_URL,
  SECRET,
} = process.env;

export default async function createApp() {
  const app = express();

  openTelemetryMiddleware(app);

  app.set('trust proxy', true);
  app.set('query parser', (str: string) => qs.parse(str, { depth: 10 }));

  app.use(
    cors({
      origin: ALLOWED_ORIGINS,
    })
  );

  app.disable('x-powered-by');
  app.use(function PoweredBy(req, res, next) {
    res.setHeader('X-Powered-By', 'HelloTica');
    next();
  });

  responseMiddleware(app);
  app.use(ExceptionWrapper as any);
  emitterMiddleware(app);
  sequelizeMiddleware(app);

  // setup logger
  const expressLoggerMiddleware = expressLogger({ logger });
  Object.defineProperty(expressLoggerMiddleware, 'name', {
    value: 'expressLoggerMiddleware',
    configurable: true,
  });
  app.use(expressLoggerMiddleware);

  app.use(function BodyParser(req, res, next) {
    bodyParser.json({
      limit: API_MAX_PAYLOAD_SIZE,
    })(req, res, (err) => {
      if (err) {
        return next(new RequestEntityTooLarge(err.message));
      }

      return next();
    });
  });

  // keepalive pod/load balancer status
  app.use('/status', (req, res, next) => res.status(200).send());
  app.use('/api/status', (req, res, next) => res.status(200).send());

  app.get('/env', async (req, res) => {
    let host = req.headers.host || 'localhost';
    const origin = req.headers.origin || '';
    if (origin !== '') {
      const hostname = new URL(origin).hostname;
      if (hostname !== null) {
        host = hostname;
      }
    }

    const tenant = await TenantService.getTenantBySubdomain(host);

    if (!tenant) {
      res.json({
        clientPortalUrl: REACT_APP_CLIENT_PORTAL_URL,
      });
      return;
    }

    res.json({
      clientPortalUrl: REACT_APP_CLIENT_PORTAL_URL,
      ...tenant,
    });
    return;
  });

  // main routes
  const isNonProdEnv = ['local', 'dev', 'staging'].some((env) =>
    NODE_ENV?.toLowerCase().startsWith(env)
  );
  const apiPath = '/api';

  // this is only needed for openapi compatibility with old controller setup
  const defaultNonAuthRoutes = [
    '/auth/login',
    '/auth/logout',
    '/auth/password/request',
    '/auth/token/introspect',
    '/auth/guest/token',
    '/tenants/subdomains',
    '/avatars',
  ];

  const authenticateMW = authenticateMiddleware({
    jwtSecret: SECRET!,
    basicUser: BASIC_USER!,
    basicPass: BASIC_PASSWORD!,
  });
  // no need to run authn on swagger docs or /auth
  isNonProdEnv || API_DOCS === 'true'
    ? app.use(
        apiPath,
        unlessMiddleware(
          authenticateMW,
          '/swagger.json',
          '/docs',
          '/docs/redoc',
          ...defaultNonAuthRoutes
        )
      )
    : app.use(
        apiPath,
        unlessMiddleware(authenticateMW, ...defaultNonAuthRoutes)
      );
  app.use(servicesMiddleware as any);

  app.use('/api', authController); // authn mw removed
  app.use('/api', reports);
  app.use('/api', users);
  app.use('/api', files);
  app.use('/api/assets', assets);
  app.use('/api', feed);
  app.use('/api', contact);
  app.use('/api', courses);
  app.use('/api', deals);
  app.use('/api', products);
  app.use('/api', search);
  app.use('/api', relatedOrganization);
  app.use('/api', activityContacts);

  openAPIMiddleware(app, apiPath, pkg, {
    enableGlob: OPENAPI_TS === 'true',
    exposeAPIDocs: isNonProdEnv || API_DOCS === 'true',
    exposeAPIDocsUI: isNonProdEnv || API_DOCS === 'true',
  });

  // has to be before cubejs since cubejs has its own error middleware that
  // cannot be disabled...
  app.use(openTelemetryError as any);
  app.use(openAPIErrorMiddleware as any);
  app.use(errorHandler as any);

  initCubejs(app, {
    apiSecret: SECRET,
    basePath: '/api/analytics',
    db: {
      host: DB_HOST,
      database: DB_DATABASE,
      username: DB_USERNAME,
      password: DB_PASSWORD,
    },
  });

  const reactRouter = express.Router();
  reactRouter.use((req, res, next) => {
    if (!req.originalUrl.startsWith('/api')) {
      (req as any).isReact = true;
    }
    return next();
  });
  if (API_DEPLOYMENT_TYPE.toLowerCase() === 'combined') {
    const portalPath = path.resolve(__dirname, '../../build/index.html');
    const publicUrl = PUBLIC_URL;

    // Prefix all href/src in the index html with the APIs public path
    let html = fs.readFileSync(portalPath, 'utf-8');
    html = html.replace(/href="\//g, `href="${publicUrl}/`);
    html = html.replace(/src="\//g, `src="${publicUrl}/`);

    reactRouter.use('/', (req, res, next) => {
      if (!req.originalUrl.startsWith('/api')) {
        (req as any).isReact = true;
      }
      return next();
    });
    reactRouter.get('/', (req, res) => {
      if (!req.originalUrl.startsWith('/api')) {
        (req as any).isReact = true;
      }
      res.send(html);
    });
    reactRouter.use('/', express.static(path.join(portalPath, '..')));
    reactRouter.use('/*', function HTML(req, res) {
      if (!req.originalUrl.startsWith('/api')) {
        (req as any).isReact = true;
      }
      res.send(html);
    });
  }
  app.use('/', reactRouter);

  return app;
}
