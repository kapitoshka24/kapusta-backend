const express = require('express');
const {
  createLine,
  updateLine,
  deleteLine,
  getAllLines,
  getBalanceCtrl,
} = require('../../../controllers/currencyMovements');

const {
  getSummary,
  getDetailedCategories,
  getSumCategories,
} = require('../../../controllers');

const asyncWrapper = require('../../../helpers/asyncWrapper');
const { validationCurrencyMovement } = require('./validation');
const { guard } = require('../../../helpers');
const router = express.Router();

router.post(
  '/create',
  guard,
  validationCurrencyMovement,
  asyncWrapper(createLine),
);
router.delete('/:lineId', guard, asyncWrapper(deleteLine));
router.patch('/update/:lineId', guard, asyncWrapper(updateLine));
router.get('/', guard, asyncWrapper(getAllLines));
router.get('/incomes', guard, asyncWrapper(getAllLines));
router.get('/expends', guard, asyncWrapper(getAllLines));
router.get('/adjustments', guard, asyncWrapper(getAllLines));
router.post('/adjustments', guard, asyncWrapper(createLine));
router.get('/balance', guard, asyncWrapper(getBalanceCtrl));

router.get('/summaryExpenses', asyncWrapper(getSummary));

router.get('/summaryIncome', asyncWrapper(getSummary));

router.get('/detailedCategories', asyncWrapper(getDetailedCategories));

router.get('/sumCategoryExpenses', asyncWrapper(getSumCategories));

router.get('/sumCategoryIncome', asyncWrapper(getSumCategories));

module.exports = router;
