import { Express, NextFunction, Request, Response } from 'express';
import { consume } from './consumer';
import { send } from './proxy';

export type EmitterMiddleware = {
  emitter: {
    emitAppEvent: typeof send;
  };
};

export function emitterMiddleware(app: Express) {
  consume();

  app.use(emitterMW as any);
}

export function emitterMW(
  req: Request & EmitterMiddleware,
  res: Response,
  next: NextFunction
) {
  req.emitter = initializeEmitterMW();

  return next();
}

export function initializeEmitterMW() {
  return {
    emitAppEvent: send,
  };
}
