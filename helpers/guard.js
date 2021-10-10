const passport = require('passport');
require('../config/passport');
const { httpCode } = require('./constants');
require('dotenv').config()


const guard = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error || !user) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }
    req.user = user;
    // req.locals.user = user переменная на текущей сессии
    // req.app.locals.vars - глобальная переменная

    return next();
  })(req, res, next);
};
module.exports = guard;
