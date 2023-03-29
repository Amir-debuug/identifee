import { Span, SpanKind } from '@opentelemetry/api';
import fse from 'fs-extra';
import { OtelMiddleware } from 'lib/middlewares/opentelemetry';
import { Liquid } from 'liquidjs';
import { createTransport, SendMailOptions, Transporter } from 'nodemailer';
import * as SMTPTransport from 'nodemailer/lib/smtp-transport';
import * as JSONTransport from 'nodemailer/lib/json-transport';
import path from 'path';

const liquidEngine = new Liquid({
  root: [path.resolve(__dirname, 'templates')],
  extname: '.liquid',
});
let singletonTransporter: Transporter;

export class Email {
  private readonly req: OtelMiddleware;
  private readonly transporter: Transporter;
  private readonly from: string;

  static async init(
    req: OtelMiddleware,
    connection: {
      transport: 'sendmail' | 'smtp' | 'mailgun';
      sendmail: {
        newline?: string;
        path?: string;
      };
      smtp: {
        pool?: string;
        host?: string;
        port?: number;
        secure?: boolean;
        user?: string;
        pass?: string;
      };
      mailgun: {
        key?: string;
        domain?: string;
      };
    },
    opts: {
      from: string;
    }
  ) {
    if (singletonTransporter) {
      return new Email(req, singletonTransporter, opts);
    }

    return req.otel.telemetry.getTracer().startActiveSpan(
      'bootup transporter',
      {
        kind: SpanKind.INTERNAL,
      },
      async (span) => {
        if (connection.transport === 'sendmail') {
          singletonTransporter = createTransport({
            sendmail: true,
            newline: connection.sendmail.newline || 'unix',
            path: connection.sendmail.path || '/usr/sbin/sendmail',
          });
        } else if (connection.transport === 'smtp') {
          let auth: boolean | { user?: string; pass?: string } = false;

          if (connection.smtp.user || connection.smtp.pass) {
            auth = {
              user: connection.smtp.user,
              pass: connection.smtp.pass,
            };
          }

          singletonTransporter = createTransport({
            pool: connection.smtp.pool,
            host: connection.smtp.host,
            port: connection.smtp.port,
            secure: connection.smtp.secure,
            auth: auth,
          } as SMTPTransport.Options);
        } else if (connection.transport === 'mailgun') {
          const mg = require('nodemailer-mailgun-transport');
          singletonTransporter = createTransport(
            mg({
              auth: {
                api_key: connection.mailgun.key,
                domain: connection.mailgun.domain,
              },
            })
          );
        } else {
          const error = new Error(
            'Illegal transport given for email. Check the EMAIL_TRANSPORT env var.'
          );
          req.otel.telemetry.setError(span, error);
          span.addEvent('defaulting to json stream');

          singletonTransporter = createTransport({
            jsonTransport: true,
          } as JSONTransport.Options);
        }

        await new Promise((resolve, reject) => {
          singletonTransporter.verify((error) => {
            if (error) {
              span.addEvent(`Couldn't connect to email server.`);
              span.addEvent(`Email verification error: ${error}`);
              span.addEvent('defaulting to json stream');
              req.otel.telemetry.setError(span, error);

              return reject(error);
            } else {
              span.addEvent('Email connection established');
              req.otel.telemetry.setOK(span);
            }

            span.end();
            return resolve(new Email(req, singletonTransporter, opts));
          });
        });
      }
    );
  }

  /**
   * Use this carefully!!!
   *
   * This assumes `init()` has been called on server bootup to establish the
   * singleton transporter.
   */
  static async bypassInit(
    req: OtelMiddleware,
    opts: {
      from: string;
    }
  ) {
    return new Email(req, singletonTransporter, opts);
  }

  private constructor(
    req: OtelMiddleware,
    transporter: Transporter,
    opts: {
      from: string;
    }
  ) {
    this.req = req;
    this.transporter = transporter;
    this.from = opts.from;
  }

  /**
   * Ideally, you should be using notificationBiz. This is a low level email
   * sending option that should only be used if you want to bypass types.
   */
  async send(
    template: string,
    emailOpts: Omit<SendMailOptions, 'from'>,
    payload: any
  ) {
    return this.req.otel.telemetry
      .getTracer()
      .startActiveSpan('send email', async (span) => {
        try {
          const html = await this.renderTemplate(template, payload);
          span.addEvent(`rendered template ${template}`);

          await this.sendRaw(
            { span },
            {
              ...emailOpts,
              from: this.from,
              html,
            }
          );
        } catch (error) {
          this.req.otel.telemetry.setError(span, error);
        } finally {
          span.end();
        }
      });
  }

  /**
   * Send raw html. I hope you know what you're doing
   */
  async sendRaw(ctx: { span?: Span }, emailOpts: SendMailOptions) {
    const recipients = [
      ...this.toRecipients(emailOpts.to),
      ...this.toRecipients(emailOpts.cc),
      ...this.toRecipients(emailOpts.bcc),
    ];

    const sender = async (span: Span) => {
      span.setAttributes({
        'email.recipients': JSON.stringify(recipients),
      });
      span.addEvent('attempting to send email');
      await this.transporter.sendMail({
        ...emailOpts,
        from: this.from,
      });
      span.addEvent('sent email');
    };

    if (!ctx.span) {
      await this.req.otel.telemetry.getTracer().startActiveSpan(
        'send email',
        {
          kind: SpanKind.INTERNAL,
        },
        async (span) => {
          await sender(span);
          span.end();
        }
      );
    } else {
      await sender(ctx.span);
    }
  }

  private toRecipients(
    recipients?:
      | string
      | { name: string; address: string }
      | (string | { name: string; address: string })[]
  ) {
    if (!recipients) {
      return [];
    }
    return typeof recipients === 'string'
      ? recipients.split(',')
      : !Array.isArray(recipients)
      ? [recipients]
      : recipients;
  }

  private async renderTemplate(template: string, payload: any) {
    const templatePath = path.join(
      __dirname,
      'templates',
      template + '.liquid'
    );

    const pathExists = await fse.pathExists(templatePath);
    if (!pathExists) {
      throw new Error(`Template "${template}" doesn't exist.`);
    }

    const templateString = await fse.readFile(templatePath, 'utf8');
    const html = await liquidEngine.parseAndRender(templateString, payload);

    return html;
  }
}
