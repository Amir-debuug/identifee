import { Resources } from 'lib/dao';
import { AuthUser } from 'lib/middlewares/auth';
import { ContextServices } from 'lib/middlewares/context';
import { EmitterMiddleware } from 'lib/middlewares/emitter';
import { Exception } from 'lib/middlewares/exception';
import { OtelMiddleware } from 'lib/middlewares/opentelemetry';
import { DB } from 'lib/middlewares/sequelize';

export type BizOpts<T extends Resources = Resources> = {
  // for abstract biz classes
  type?: T;

  db: DB['models'];
  emitter: EmitterMiddleware['emitter'];
  exception: Exception;
  services: ContextServices;
  user: AuthUser;
} & OtelMiddleware;
