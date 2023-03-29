import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import got from 'got';
import { OtelMiddleware } from 'lib/middlewares/opentelemetry';
import { URL, URLSearchParams } from 'url';

export class Rest {
  private req: OtelMiddleware;
  private readonly host: string;
  private readonly url: URL;

  constructor(req: OtelMiddleware, opts: { host: string }) {
    this.req = req;
    this.host = opts.host;

    this.url = new URL(this.host);
  }

  protected async request<T extends {} = {}>(
    path: string,
    opts: {
      method: 'POST' | 'GET' | 'PUT' | 'DELETE';
      body?: { [key: string]: any };
      query?: { [key: string]: any };
      headers?: { [key: string]: any };
    }
  ) {
    return this.req.otel.telemetry
      .getTracer()
      .startActiveSpan(
        this.url.host,
        { kind: this.req.otel.telemetry.sdk.SpanKind.SERVER },
        async (span) => {
          let response: { body?: any; statusCode?: number } = {};

          try {
            span.setAttributes({
              [SemanticAttributes.HTTP_METHOD]: opts.method,
              'http.body': JSON.stringify(
                this.req.otel.telemetry.obfuscate(opts.body) || {}
              ),
              'http.headers': JSON.stringify(
                this.req.otel.telemetry.obfuscate(opts.headers) || {}
              ),
              'http.path': path,
              'http.query': JSON.stringify(
                this.req.otel.telemetry.obfuscate(opts.query) || {}
              ),
            });

            const { body, statusCode } = await got(`${this.host}${path}`, {
              json: opts.body,
              headers: opts.headers,
              method: opts.method,
              responseType: 'json',
              searchParams: new URLSearchParams(opts.query || {}),
            });

            response = { body: body as T, statusCode };

            return { body: body as T, statusCode };
          } catch (error) {
            response = {
              body: error.response?.body,
              statusCode: error.response?.statusCode || 500,
            };
            this.req.otel.telemetry.setError(span, error);

            throw error;
          } finally {
            span.setAttributes({
              [SemanticAttributes.HTTP_STATUS_CODE]: response.statusCode,
              'http.res.body': JSON.stringify(
                this.req.otel.telemetry.obfuscate(response.body) || {}
              ),
            });

            span.end();
          }
        }
      );
  }
}
