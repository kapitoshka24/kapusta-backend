const express = require('express');
const {
  createLine,
  updateLine,
  deleteLine,
  getAllIncomesLines,
  getAllExpendsLines,
  getAllAdjustmentsLines,
} = require('../../../controllers/currencyMovements');

const { getSummary } = require('../../../controllers');

const asyncWrapper = require('../../../helpers/asyncWrapper');
const { validationCurrencyMovement } = require('./validation');

const router = express.Router();

router.post('/create', validationCurrencyMovement, asyncWrapper(createLine));
router.delete('/:lineId', asyncWrapper(deleteLine));
router.patch('/update/:lineId', asyncWrapper(updateLine));
router.get('/incomes', asyncWrapper(getAllIncomesLines));
router.get('/expends', asyncWrapper(getAllExpendsLines));
router.get('/adjustments', asyncWrapper(getAllAdjustmentsLines));

router.get('/summaryExpenses', asyncWrapper(getSummary));

router.get('/summaryIncome', asyncWrapper(getSummary));

module.exports = router;
