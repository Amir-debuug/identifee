import { AuthMiddleware } from '../auth';
import { extendAs } from '../context';
import { OtelMiddleware } from '../opentelemetry';
import { eventBus, EventName, EventTask, EventTopic } from './types';

/**
 * Sends an event on the emitter bus
 */
export async function send<T extends EventName>(
  user: AuthMiddleware['user'],
  task: EventTask<T>,
  otel?: Partial<OtelMiddleware['otel']>
): Promise<void> {
  const req = await extendAs(user, { otel });

  await req.otel.telemetry
    .getTracer()
    .startActiveSpan(
      `event proxy - ${task.event}`,
      { kind: req.otel.telemetry.sdk.SpanKind.INTERNAL },
      async (span) => {
        try {
          await eventBus.emitAsync(
            EventTopic.APP,
            {
              emitter: req.emitter,
              services: req.services,
              span,
              telemetry: req.otel.telemetry,
              user: req.user,
            },
            task
          );
        } catch (error) {
          req.otel.telemetry.setError(span, error);
        } finally {
          span.end();
        }
      }
    );
}
