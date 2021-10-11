const { apiLimit } = require('../config/rate-limit.json');

const httpCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

const statusCode = {
  SUCCESS: 'ok',
  ERROR: 'error',
};

const message = {
  NOT_FOUND: 'Not found',
  BAD_EMAIL_OR_PASSWORD: 'Email or password is wrong',
  NOT_AUTHORIZED: 'Not authorized',
  CONFLICT: 'Email in use',
  TOO_MANY_REQUESTS: 'Too mach requests, try later...',
  DB_CONNECT_SUCCESS: 'Database connection successful',
  DB_CONNECT_TERMINATED: 'Connection to database terminated',
  DB_CONNECT_ERROR: 'Error connection to db:',
  VERIFY_SUCCESS: 'Verification successful',
  VERIFY_RESEND: 'Verification email sent',
  MISSING_FIELDS: 'Missing fields',
  INCORRECT_DATA: 'Incorrect data entry',
};

const limiterAPI = {
  windowMs: apiLimit.windowMs,
  max: apiLimit.max,
  handler: (req, res, _) => {
    return res.status(httpCode.TOO_MANY_REQUESTS).json({
      status: 'error',
      code: httpCode.TOO_MANY_REQUESTS,
      message: 'Sorry, you did too many requests.',
    });
  },
};

module.exports = {
  httpCode,
  message,
  statusCode,
  limiterAPI,
};
