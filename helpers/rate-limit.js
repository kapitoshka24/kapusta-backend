const rateLimit = require('express-rate-limit');
const { httpCode } = require('./constants');
const { accountLimit } = require('../config/rate-limit.json');

const createAccountLimiter = rateLimit({
  windowMs: accountLimit.windowMs, // 1 hour window
  max: accountLimit.max, // start blocking after 5 requests
  handler: (req, res, next) => {
    res.status(httpCode.BAD_REQUEST).json({
      status: 'error',
      code: httpCode.BAD_REQUEST,
      message:
        'Исчерпано лимит создания аккаунтов за один час, попробуйте позже',
    });
  },
});

module.exports = { createAccountLimiter };
