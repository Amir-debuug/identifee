import { ExpressErrorFn } from 'lib/types/express';
import { ExceptionError } from './exception';

// Note: keep all 4 parameters here. That's how Express recognizes it's the error handler, even if
// we don't use next
const errorHandler: ExpressErrorFn<ExceptionError> = (err, req, res, next) => {
  if (!(err instanceof Error) && typeof err === 'object') {
    err = new Error(JSON.stringify(err));
  }

  let payload: any = {
    errors: [],
  };

  const errors = Array.isArray(err) ? err : [err];

  const isCustomException = (error: Error | ExceptionError) =>
    error instanceof ExceptionError;

  const allCustomExceptions = errors.every(isCustomException);

  if (!allCustomExceptions) {
    res.status(500);
  } else {
    const statuses = (errors as ExceptionError[]).map(({ status }) => status);
    const uniqueStatuses = new Set(statuses);

    // If there's multiple different status codes in the errors, use 500
    let status = 500;
    if (uniqueStatuses.size === 1) {
      status = statuses[0];
    }

    res.status(status);
  }

  (errors as ExceptionError[]).forEach((error) => {
    const isCustomError = isCustomException(error);
    let webError = error;
    if (!isCustomError) {
      webError = new req.exception.InternalServerError();
    }

    const formattedError = {
      message: webError.message,
      extensions: {
        code: webError.code,
      },
    };
    res.status(webError.status);

    if (isCustomError) {
      payload.errors.push(formattedError);
    } else {
      payload = {
        errors: [formattedError],
      };
    }
  });

  console.error(err.stack);

  return res.json(payload);
};

export default errorHandler;
