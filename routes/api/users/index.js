const express = require('express');
const controllerUser = require('../../../controllers/users')
const { register, login, logout } = require('../../../controllers/auth');
const { guard, asyncWrapper, createAccountLimiter } = require('../../../helpers');
const router = express.Router();
const {
  validationRegistrationUser,
  validationLoginUser,
} = require('./validation');

router.get('/current', controllerUser.getCurrentUser);
router.post(
  '/registration',
  validationRegistrationUser,
  createAccountLimiter,
  controllerUser.signup,
);
router.post("/logout", controllerUser.authorize, controllerUser.logout);
router.post('/login', validationLoginUser, controllerUser.login);


router.get('/verify/:token', controllerUser.verify);
router.post('/verify', controllerUser.repeatEmailVerification);

module.exports = router;
