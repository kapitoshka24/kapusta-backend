const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');
const { UserService } = require('../services');
require('dotenv').config();
const SECRET_KEY = process.env.JWT_SECRET;

const params = {
  secretOrKey: SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
const service = new UserService();

passport.use(
  new Strategy(params, async (payload, done) => {
    try {
      if (!payload.sid) {
        return done(new Error('Session not found'));
      }
      const user = await service.findById(payload.uid);
      if (!user) {
        return done(new Error('User not found'));
      }
      if (!user.isVerified) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      done(error);
    }
  }),
);
