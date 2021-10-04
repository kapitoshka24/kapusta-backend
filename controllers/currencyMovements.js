const { NotFound } = require('http-errors');
// const { incomes, expends, adjustments } = require('../helpers/categories');
const { httpCode, message } = require('../helpers/constants');

const {
  addLine,
  update,
  delLine,
  getAllLines,
} = require('../repositories/currencyMovements');

const createLine = async (req, res) => {
  const { body } = req;
  if (body) {
    const { date, name, category, sum } = await addLine(body);
    return res.status(201).json({
      status: 'ok',
      code: 201,
      data: {
        createdLine: { date, name, category, sum },
      },
    });
  }
};

const updateLine = async (req, res, next) => {
  const {
    body: { name: reqName, sum: reqSum },
    params: { lineId },
  } = req;
  if (reqName || reqSum) {
    const { date, name, category, sum } = await update(lineId, {
      reqName,
      reqSum,
    });
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        createdLine: { date, name, category, sum },
      },
    });
  }
  next({
    status: httpCode.BAD_REQUEST,
    message: message.MISSING_FIELDS,
  });
};

const deleteLine = async (req, res) => {
  const { lineId } = req.params;
  const message = await delLine(lineId);
  if (message) {
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        message,
      },
    });
  }
  throw new NotFound('NOT_FOUND');
};

const getAllIncomesLines = async (req, res) => {
  const { query } = req;
  const { docs: lines } = await getAllLines(query);
  return res.json({
    status: 'ok',
    code: 200,
    data: {
      incomes: lines,
    },
  });
};

const getAllExpendsLines = async (_, res) => {
  const lines = await getAllLines();
  return res.json({
    status: 'ok',
    code: 200,
    data: {
      incomes: lines,
    },
  });
};

const getAllAdjustmentsLines = async (_, res) => {
  const lines = await getAllLines();
  return res.json({
    status: 'ok',
    code: 200,
    data: {
      adjustments: lines,
    },
  });
};

module.exports = {
  createLine,
  updateLine,
  deleteLine,
  getAllIncomesLines,
  getAllExpendsLines,
  getAllAdjustmentsLines,
};
