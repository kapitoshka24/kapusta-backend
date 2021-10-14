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
const {
  validationCurrencyMovement,
  validationUpdateCurrencyMovement,
} = require('./validation');
const { authorize } = require('../../../controllers/users');
const router = express.Router();

router.post(
  '/create',
  authorize,
  validationCurrencyMovement,
  asyncWrapper(createLine),
);
router.delete('/:lineId', authorize, asyncWrapper(deleteLine));
router.patch(
  '/update/:lineId',
  authorize,
  validationUpdateCurrencyMovement,
  asyncWrapper(updateLine),
);

router.get('/', authorize, asyncWrapper(getAllLines));
router.get('/incomes', authorize, asyncWrapper(getAllLines));
router.get('/expends', authorize, asyncWrapper(getAllLines));
router.get('/adjustments', authorize, asyncWrapper(getAllLines));
router.post('/adjustments', authorize, asyncWrapper(createLine));
router.get('/balance', authorize, asyncWrapper(getBalanceCtrl));
router.get('/total-months', authorize, asyncWrapper(getTotalMonthsCtrl));

router.get('/summary-expenses', authorize, asyncWrapper(getSummary));

router.get('/summary-income', authorize, asyncWrapper(getSummary));

router.get(
  '/detailed-categories',
  authorize,
  asyncWrapper(getDetailedCategories),
);

router.get('/sum-category', authorize, asyncWrapper(getSumCategoriesCtrl));

module.exports = router;
