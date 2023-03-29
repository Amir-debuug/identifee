import { HTTPError } from './utils';

export class ExceptionError<T extends HTTPError = HTTPError> extends Error {
  public status: T;
  public code: string;

  constructor(status: T, code: string, message?: string) {
    super(message);

    this.status = status;
    this.code = code;
  }
}

class BadRequest extends ExceptionError<HTTPError.BAD_REQUEST> {
  constructor(code: string, message: string) {
    super(HTTPError.BAD_REQUEST, code, message);
  }
}
export class InvalidPayload extends BadRequest {
  constructor(message = 'Bad request.') {
    super('INVALID_PAYLOAD', message);
  }
}

class Unauthenticated extends ExceptionError<HTTPError.UNAUTHENTICATED> {
  constructor(code: string, message: string) {
    super(HTTPError.UNAUTHENTICATED, code, message);
  }
}
export class InvalidCredentials extends Unauthenticated {
  constructor(message = 'Invalid user credentials.') {
    super('INVALID_CREDENTIALS', message);
  }
}
export class InvalidOTP extends Unauthenticated {
  constructor(message = 'Invalid user OTP.') {
    super('INVALID_OTP', message);
  }
}
export class UserSuspended extends Unauthenticated {
  constructor(message = 'User suspended.') {
    super('USER_SUSPENDED', message);
  }
}

export class Forbidden extends ExceptionError<HTTPError.FORBIDDEN> {
  constructor(message = "You don't have permission to access this") {
    super(HTTPError.FORBIDDEN, 'FORBIDDEN', message);
  }
}

class NotFound extends ExceptionError<HTTPError.NOT_FOUND> {
  constructor(code: string, message: string) {
    super(HTTPError.NOT_FOUND, code, message);
  }
}
export class ResourceNotFound extends NotFound {
  public resource: string;

  constructor(resource: string) {
    super('RESOURCE_NOT_FOUND', `${resource} does not exist`);
    this.resource = resource;
  }
}
export class RouteNotFound extends NotFound {
  constructor(path: string) {
    super('ROUTE_NOT_FOUND', `Route ${path} doesn't exist.`);
  }
}

export class Conflict extends ExceptionError<HTTPError.CONFLICT> {
  constructor(message?: string) {
    super(HTTPError.CONFLICT, 'CONFLICT', message);
  }
}

export class RequestEntityTooLarge extends ExceptionError<HTTPError.REQUEST_ENTITY_TOO_LARGE> {
  constructor(message?: string) {
    super(
      HTTPError.REQUEST_ENTITY_TOO_LARGE,
      'REQUEST_ENTITY_TOO_LARGE',
      message
    );
  }
}

export class InternalServerError extends ExceptionError<HTTPError.INTERNAL_SERVER_ERROR> {
  constructor(message = 'An unexpected error occurred.') {
    super(HTTPError.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR', message);
  }
}

export class ServiceUnavailable extends ExceptionError<HTTPError.SERVER_UNAVAILABLE> {
  constructor(message?: string) {
    super(HTTPError.SERVER_UNAVAILABLE, 'SERVICE_UNAVAILABLE', message);
  }
}
