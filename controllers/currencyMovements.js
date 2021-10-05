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
    body,
    params: { lineId },
  } = req;
  const { name: reqName, sum: reqSum } = body;

  console.log(reqName, reqSum);
  if (reqName || reqSum) {
    const { date, name, category, sum } = await update(lineId, {
      name: reqName,
      sum: reqSum,
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

const getAllIncomesLines = async (req, res, next) => {
  const { query, path } = req;
  const { docs: lines } = await getAllLines(query, path.slice(1));
  if (lines.length > 0) {
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        incomes: lines,
      },
    });
  }
  next({
    status: httpCode.NOT_FOUND,
    message: message.NOT_FOUND,
  });
};

const getAllExpendsLines = async (req, res, next) => {
  const { query, path } = req;
  const { docs: lines } = await getAllLines(query, path.slice(1));
  if (lines.length > 0) {
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        expends: lines,
      },
    });
  }
  next({
    status: httpCode.NOT_FOUND,
    message: message.NOT_FOUND,
  });
};

const getAllAdjustmentsLines = async (req, res, next) => {
  const { query, path } = req;
  const { docs: lines } = await getAllLines(query, path.slice(1));
  if (lines.length > 0) {
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        expends: lines,
      },
    });
  }
  next({
    status: httpCode.NOT_FOUND,
    message: message.NOT_FOUND,
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
