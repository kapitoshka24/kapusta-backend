const express = require('express');
const {
  createLine,
  updateLine,
  deleteLine,
  getAllLines,
  getBalanceCtrl,
} = require('../../../controllers/currencyMovements');

const { getSummary } = require('../../../controllers');

const asyncWrapper = require('../../../helpers/asyncWrapper');
const { validationCurrencyMovement } = require('./validation');

const { getdetailedCategories } = require('../../../controllers');

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

router.get('/summaryExpenses', asyncWrapper(getSummary));

router.get('/summaryIncome', asyncWrapper(getSummary));

router.get('/detailedCategories', asyncWrapper(getdetailedCategories));

module.exports = router;
