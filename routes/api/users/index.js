const express = require('express');
const controllerUser = require('../../../controllers/users');
const {
  createAccountLimiter,
  asyncWrapper,
  guard,
} = require('../../../helpers');
const router = express.Router();
const {
  validationRegistrationUser,
  validationLoginUser,
  validateRefreshToken,
  validationForgotten,
  validationResetPassword,
  validateGoogleRegister,
} = require('./validation');

router.post(
  '/registration',
  validationRegistrationUser,
  createAccountLimiter,
  controllerUser.signup,
);
router.post('/logout', guard, controllerUser.authorize, controllerUser.logout);
router.post('/login', validationLoginUser, controllerUser.login);
router.post(
  '/refresh',
  validateRefreshToken,
  asyncWrapper(controllerUser.refreshTokens),
);
router.get('/verify/:token', controllerUser.verify);
router.post('/verify', controllerUser.repeatEmailVerification);
router.get('/google', asyncWrapper(controllerUser.googleAuth));
router.post(
  '/google/v1',
  validateGoogleRegister,
  asyncWrapper(controllerUser.googleRegister),
);
router.get('/google-redirect', asyncWrapper(controllerUser.googleRedirect));
router.get('/current', guard, controllerUser.getCurrentUser);
router.post('/forgotten', validationForgotten, controllerUser.forgotten);
router.post(
  '/resetPassword',
  validationResetPassword,
  controllerUser.resetPassword,
);

module.exports = router;
