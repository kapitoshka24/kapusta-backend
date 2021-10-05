const express = require('express');
const controllerUser = require('../../../controllers/users');
const guard = require('../../../helpers/guard');
const createAccountLimiter = require('../../../helpers/rate-limit');
const router = express.Router();

router.get('/current', guard, controllerUser.getCurrentUser);
router.post('/registration', createAccountLimiter, controllerUser.signup);
router.post('/login', controllerUser.login);
router.post('/logout', guard, controllerUser.logout);

router.get('/verify/:token', controllerUser.verify);
router.post('/verify', controllerUser.repeatEmailVerification);

module.exports = router;
