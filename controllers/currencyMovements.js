const { NotFound } = require('http-errors');
const { adjustments } = require('../helpers/categories');
const { httpCode, message } = require('../helpers/constants');

const {
  addLine,
  update,
  delLine,
  getAll,
  getBalance,
} = require('../repositories/currencyMovements');

const createLine = async (req, res) => {
  const {
    user: { id: userId },
    body,
  } = req;

  const { date, name, category: categoryReq, sum: sumReq } = body;
  if (adjustments.includes(categoryReq)) {
    const oldBalance = await getBalance(userId);
    const correctBalance = sumReq - oldBalance;
    const createdLine = await addLine(userId, {
      date,
      name,
      category: categoryReq,
      sum: correctBalance,
    });
    res.line = createdLine;
  } else {
    const createdLine = await addLine(userId, body);
    res.line = createdLine;
  }

  return res.status(201).json({
    status: 'ok',
    code: 201,
    data: {
      createdLine: res.line._doc,
    },
  });
};

const updateLine = async (req, res, next) => {
  const {
    user: { id: userId },
    body,
    params: { lineId },
  } = req;
  const { name: reqName, sum: reqSum } = body;
  const createdLine = await update(userId, lineId, {
    name: reqName,
    sum: reqSum,
  });
  if (createdLine && (reqName || reqSum)) {
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        createdLine,
      },
    });
  }
  next({
    status: httpCode.BAD_REQUEST,
    message: message.MISSING_FIELDS,
  });
};

const deleteLine = async (req, res) => {
  const {
    user: { id: userId },
    params,
  } = req;
  const { lineId } = params;
  const message = await delLine(userId, lineId);
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

const getBalanceCtrl = async (req, res, next) => {
  const {
    user: { id: userId },
  } = req;
  const balance = await getBalance(userId);
  if (balance || typeof balance === 'number') {
    return res.json({
      status: 'ok',
      code: 200,
      data: {
        balance,
      },
    });
  }
  next({
    status: httpCode.NOT_FOUND,
    message: message.NOT_FOUND,
  });
};

const getAllLines = async (req, res, next) => {
  const {
    user: { id: userId },
    query,
    path,
  } = req;
  const pathName = path?.slice(1);
  const { docs: lines } = await getAll(userId, query, pathName);
  if (lines.length > 0) {
    return res.json({
      status: 'ok',
      code: 200,
      data: pathName ? { [pathName]: lines } : { allLines: lines },
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
  getAllLines,
  getBalanceCtrl,
};
