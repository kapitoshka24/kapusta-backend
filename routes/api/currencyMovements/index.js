const express = require('express');
const {
  createLine,
  updateLine,
  deleteLine,
  getAllLines,
  getBalanceCtrl,
  getTotalMonthsCtrl,
  getDetailedCategories,
  getSumCategoriesCtrl,
  getSummary,
} = require('../../../controllers/currencyMovements');

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
router.get('/totalMonths', guard, asyncWrapper(getTotalMonthsCtrl));

router.get('/summaryExpenses', guard, asyncWrapper(getSummary));

router.get('/summaryIncome', guard, asyncWrapper(getSummary));

router.get('/detailedCategories', guard, asyncWrapper(getDetailedCategories));

router.get('/sumCategory', guard, asyncWrapper(getSumCategoriesCtrl));

module.exports = router;
