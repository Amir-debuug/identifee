export enum HTTPError {
  BAD_REQUEST = 400,
  UNAUTHENTICATED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  REQUEST_ENTITY_TOO_LARGE = 413,
  INTERNAL_SERVER_ERROR = 500,
  SERVER_UNAVAILABLE = 503,
}
