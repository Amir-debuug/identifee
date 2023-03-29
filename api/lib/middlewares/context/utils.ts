import { AuthUser } from '../auth';
import { initializeEmitterMW } from '../emitter';
import { exception } from '../exception';
import { initializeOtel, OtelMiddleware } from '../opentelemetry';
import { sequelize } from '../sequelize';
import { createServiceMiddleware } from './middleware';

export async function extendAs(
  user: AuthUser,
  opts: {
    otel?: Partial<OtelMiddleware['otel']>;
  }
) {
  const newReq = {
    db: sequelize.models,
    emitter: initializeEmitterMW(),
    exception,
    otel: {
      telemetry: opts.otel?.telemetry || initializeOtel().otel.telemetry,
      metrics: opts.otel?.metrics || initializeOtel().otel.metrics,
    },
    user,
  };
  const services = await createServiceMiddleware(newReq);

  return {
    ...newReq,
    services,
  };
}
