import { EmitterMiddleware } from 'lib/middlewares/emitter';
import { Context } from './Context';
import { BizOpts } from './types';

export class Biz extends Context {
  protected readonly emitter: EmitterMiddleware['emitter'];
  protected readonly exception: BizOpts['exception'];
  protected readonly otel: BizOpts['otel'];

  constructor(biz: BizOpts) {
    super(biz);

    this.emitter = biz.emitter;
    this.exception = biz.exception;
    this.otel = biz.otel;
  }
}
