const express = require('express');
const {
  createLine,
  updateLine,
  deleteLine,
  getAllIncomesLines,
  getAllExpendsLines,
  getAllAdjustmentsLines,
} = require('../../../controllers/currencyMovements');
const asyncWrapper = require('../../../helpers/asyncWrapper');
const { validationCurrencyMovement } = require('./validation');

const router = express.Router();

router.post('/create', validationCurrencyMovement, asyncWrapper(createLine));
router.delete('/:lineId', asyncWrapper(deleteLine));
router.patch('/update/:lineId', asyncWrapper(updateLine));
router.get('/', asyncWrapper(getAllIncomesLines));
router.get('/', asyncWrapper(getAllExpendsLines));
router.get('/', asyncWrapper(getAllAdjustmentsLines));

module.exports = router;
