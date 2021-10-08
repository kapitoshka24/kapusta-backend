const express = require('express');
const controllerUser = require('../../../controllers/users')
const { register, login, logout } = require('../../../controllers/auth');
const { guard, asyncWrapper, createAccountLimiter } = require('../../../helpers');
const router = express.Router();
const {
  validationRegistrationUser,
  validationLoginUser,
} = require('./validation');

router.get('/current', guard, controllerUser.getCurrentUser);
router.post(
  '/registration',
  createAccountLimiter,
  asyncWrapper(register),
);
router.post('/login', validationLoginUser, asyncWrapper(login));
router.post('/logout', guard, asyncWrapper(logout));

router.get('/verify/:token', controllerUser.verify);
router.post('/verify', controllerUser.repeatEmailVerification);

module.exports = router;
