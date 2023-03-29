import { Span } from '@opentelemetry/api';
import { setSpan } from '@opentelemetry/api/build/src/trace/context-utils';
import { subscriptions } from './subscriptions';
import { eventBus, EventReq, EventTask, EventTopic } from './types';

/**
 * Consumes an event from the event bus and executes the associated tasks.
 */
export function consume() {
  eventBus.on(
    EventTopic.APP,
    async (req: EventReq & { span: Span }, task: EventTask) => {
      req.otel.telemetry.sdk.context.with(
        setSpan(req.otel.telemetry.sdk.context.active(), req.span),
        () => {
          return req.otel.telemetry
            .getTracer()
            .startActiveSpan(
              `event consumer - ${task.event}`,
              { kind: req.otel.telemetry.sdk.SpanKind.INTERNAL },
              async (eventConsumerSpan) => {
                const taskFns = subscriptions[task.event];
                eventConsumerSpan.addEvent(
                  `found ${taskFns.length} tasks to execute`
                );

                Promise.all(
                  taskFns.map(async (taskFn) => {
                    return req.otel.telemetry
                      .getTracer()
                      .startActiveSpan(
                        `event task - ${taskFn.name}`,
                        { kind: req.otel.telemetry.sdk.SpanKind.INTERNAL },
                        async (span) => {
                          try {
                            await taskFn(
                              {
                                emitter: req.emitter,
                                otel: req.otel,
                                services: req.services,
                                user: req.user,
                              },
                              task as any
                            );
                          } catch (error) {
                            req.otel.telemetry.setError(span, error);
                          } finally {
                            span.end();
                          }
                        }
                      );
                  })
                );
                eventConsumerSpan.end();
              }
            );
        }
      );
    }
  );
}
