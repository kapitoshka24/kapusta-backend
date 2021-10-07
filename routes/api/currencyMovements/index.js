const express = require('express');
const {
  createLine,
  updateLine,
  deleteLine,
  getAllLines,
  getBalanceCtrl,
} = require('../../../controllers/currencyMovements');
const asyncWrapper = require('../../../helpers/asyncWrapper');
const { validationCurrencyMovement } = require('./validation');

const router = express.Router();

router.post('/create', validationCurrencyMovement, asyncWrapper(createLine));
router.delete('/:lineId', asyncWrapper(deleteLine));
router.patch('/update/:lineId', asyncWrapper(updateLine));
router.get('/', asyncWrapper(getAllLines));
router.get('/incomes', asyncWrapper(getAllLines));
router.get('/expends', asyncWrapper(getAllLines));
router.get('/adjustments', asyncWrapper(getAllLines));
router.post('/adjustments', asyncWrapper(createLine));
router.get('/balance', asyncWrapper(getBalanceCtrl));

module.exports = router;
