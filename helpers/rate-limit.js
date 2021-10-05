const rateLimit = require('express-rate-limit');
const { HttpCode } = require('./constants');
const { accountLimit } = require('../config/rate-limit.json');

const createAccountLimiter = rateLimit({
  windowMs: accountLimit.windowMs, // 1 hour window
  max: accountLimit.max, // start blocking after 5 requests
  handler: (req, res, next) => {
    res.status(HttpCode.BAD_REQUEST).json({
      status: 'error',
      code: HttpCode.BAD_REQUEST,
      message:
        'Исчерпано лимит создания аккаунтов за один час, попробуйте позже',
    });
  },
});

module.exports = createAccountLimiter;
