const passport = require('passport');
require('../config/passport');
const { httpCode } = require('./constants');

const guard = (req, res, next) => {
  passport.authenticate('jwt', { session: true }, (error, user) => {
    const headerAuth = req.get('Authorization');
    let token = null;
    if (headerAuth) {
      token = authorizationHeader.replace("Bearer ", "");
    }
    if (error || !user || token !== user?.token) {
      return res.status(httpCode.UNAUTHORIZED).json({
        status: 'error',
        code: httpCode.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }
    // req.user = user;
    req.locals.user = user
    // переменная на текущей сессии
    // req.app.locals.vars - глобальная переменная

    return next();
  })(req, res, next);
};
module.exports = { guard };
