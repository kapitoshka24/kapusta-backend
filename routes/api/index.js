const express = require('express');
const router = express.Router();

router.use('/users', require('./users'));
router.use('/currencymovements', require('./currencyMovements'));

module.exports = router;
