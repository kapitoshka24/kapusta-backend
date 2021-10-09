const express = require('express');
const controllerUser = require('../../../controllers/users')
const { createAccountLimiter } = require('../../../helpers');
const router = express.Router();
const {
  validationRegistrationUser,
  validationLoginUser,
  validateRefreshToken
} = require('./validation');


router.post(
  '/registration',
  validationRegistrationUser,
  createAccountLimiter,
  controllerUser.signup,
);
router.post("/logout", controllerUser.authorize, controllerUser.logout);
router.post('/login', validationLoginUser, controllerUser.login);
router.post("/refresh", validateRefreshToken, controllerUser.refreshTokens);
router.get('/verify/:token', controllerUser.verify);
router.post('/verify', controllerUser.repeatEmailVerification);
router.get('/current', controllerUser.getCurrentUser);

module.exports = router;
