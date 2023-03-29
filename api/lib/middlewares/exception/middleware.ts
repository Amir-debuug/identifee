import { NextFunction, Request, Response } from 'express';
import {
  InvalidPayload,
  InvalidCredentials,
  InvalidOTP,
  UserSuspended,
  Forbidden,
  ResourceNotFound,
  RouteNotFound,
  Conflict,
  RequestEntityTooLarge,
  InternalServerError,
  ServiceUnavailable,
  ExceptionError,
} from './exception';

export const exception = {
  Exception: ExceptionError,
  InvalidPayload,
  InvalidCredentials,
  InvalidOTP,
  UserSuspended,
  Forbidden,
  Conflict,
  ResourceNotFound,
  RouteNotFound,
  RequestEntityTooLarge,
  InternalServerError,
  ServiceUnavailable,
};

export type Exception = typeof exception;

export type ExceptionMiddleware = {
  exception: Exception;
};

export function ExceptionWrapper(
  req: Request & ExceptionMiddleware,
  res: Response,
  next: NextFunction
) {
  req.exception = exception;

  return next();
}
