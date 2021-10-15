const { NotFound } = require('http-errors');

const { monthsArray } = require('../helpers');
const { adjustments } = require('../helpers/categories');
const { httpCode, statusCode, message } = require('../helpers/constants');

const {
  addLine,
  update,
  delLine,
  getAll,
  getBalance,
  getTotalMonths,
  getDetailedInfoCategories,
  getSumCategories,
  getSummaryYear,
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

  return res.status(httpCode.CREATED).json({
    status: statusCode.SUCCESS,
    code: httpCode.CREATED,
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
      status: statusCode.SUCCESS,
      code: httpCode.OK,
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
  const resMessage = await delLine(userId, lineId);
  if (resMessage) {
    return res.json({
      status: statusCode.SUCCESS,
      code: httpCode.OK,
      data: {
        resMessage,
      },
    });
  }
  throw new NotFound(message.NOT_FOUND);
};

const getBalanceCtrl = async (req, res) => {
  const {
    user: { id: userId },
  } = req;
  const balance = await getBalance(userId);
  if (balance || typeof balance === 'number') {
    return res.json({
      status: statusCode.SUCCESS,
      code: httpCode.OK,
      data: {
        balance,
      },
    });
  }
  return res.json({
    status: statusCode.SUCCESS,
    code: httpCode.OK,
    message: message.NOT_FOUND,
  });
};

const getAllLines = async (req, res) => {
  const {
    user: { id: userId },
    query,
    path,
  } = req;
  const pathName = path?.slice(1);
  const { docs: lines } = await getAll(userId, query, pathName);
  if (lines.length > 0) {
    return res.json({
      status: statusCode.SUCCESS,
      code: httpCode.OK,
      data: pathName ? { [pathName]: lines } : { allLines: lines },
    });
  }

  return res.json({
    status: statusCode.SUCCESS,
    code: httpCode.OK,
    message: message.NOT_FOUND,
  });
};

const getTotalMonthsCtrl = async (req, res, next) => {
  const {
    user: { id: userId },
  } = req;
  const totalMonths = await getTotalMonths(userId);
  const getAggregatedMonths = () => {
    const years = {};
    totalMonths.map(({ month }) => {
      const splittingDate = month.split('-');
      splittingDate[1] = monthsArray[+splittingDate[1] - 1];
      if (!years[+splittingDate[0]]) {
        years[splittingDate[0]] = [splittingDate[1]];
      } else {
        years[splittingDate[0]].push(splittingDate[1]);
      }
    });
    return years;
  };
  if (totalMonths.length > 0) {
    return res.json({
      status: statusCode.SUCCESS,
      code: httpCode.OK,
      data: { totalMonths: getAggregatedMonths() },
    });
  }
  next({
    status: httpCode.NOT_FOUND,
    message: message.NOT_FOUND,
  });
};

const getDetailedCategories = async (req, res) => {
  const { category, date } = req.query;

  const {
    user: { id: userId },
  } = req;

  const dateSplit = date.split('/');

  const validateDate = /^(0[1-9]|1[0-2])\/(200[0-9]|201[0-9]|202[0-1])$/;

  if (!validateDate.test(date)) {
    res.json({
      status: statusCode.ERROR,
      code: httpCode.BAD_REQUEST,
      message: message.INCORRECT_DATA,
    });
  }

  const response = await getDetailedInfoCategories(category, dateSplit, userId);

  if (response.length === 0) {
    res.json({
      status: statusCode.SUCCESS,
      code: httpCode.OK,
      message: message.NOT_FOUND,
    });
    return;
  }

  res.json({
    status: statusCode.SUCCESS,
    code: httpCode.OK,
    response,
  });
};

const getSumCategoriesCtrl = async (req, res) => {
  const { date } = req.query;

  const {
    user: { id: userId },
  } = req;

  const dateSplit = date.split('/');

  const validateDate = /^(0[1-9]|1[0-2])\/(200[0-9]|201[0-9]|202[0-1])$/;

  if (!validateDate.test(date)) {
    res.json({
      status: statusCode.ERROR,
      code: httpCode.BAD_REQUEST,
      message: message.INCORRECT_DATA,
    });
  }

  const validate = true;
  const response = await getSumCategories(dateSplit, validate, userId);

  const summary = { expenses: [], income: [] };

  let totalExpenses = 0;
  let totalIncome = 0;

  // eslint-disable-next-line array-callback-return
  response.map(value => {
    const { _id, total } = value;

    if (value.categoryValidate) {
      summary.expenses.push({ _id, total });
      totalExpenses += total;
    } else {
      summary.income.push({ _id, total });
      totalIncome += total;
    }
  });

  if (response.length === 0) {
    res.json({
      status: statusCode.SUCCESS,
      code: httpCode.OK,
      message: message.NOT_FOUND,
    });
    return;
  }

  res.json({
    status: statusCode.SUCCESS,
    code: httpCode.OK,
    summary,
    totalExpenses,
    totalIncome,
  });
};

const getSummary = async (req, res) => {
  const pathСheck = req.path === '/summary-expenses';

  const { year } = req.query;

  const {
    user: { id: userId },
  } = req;

  const validateDate = /^(200[0-9]|201[0-9]|202[0-1])$/;

  if (!validateDate.test(year)) {
    res.json({
      status: statusCode.ERROR,
      code: httpCode.BAD_REQUEST,
      message: message.INCORRECT_DATA,
    });
  }

  const response = await getSummaryYear(year, pathСheck, userId);

  for (const i in response) {
    response[i]._id = monthsArray[response[i]._id - 1];
  }

  res.json({
    status: statusCode.SUCCESS,
    code: httpCode.OK,
    result: response,
  });
};

module.exports = {
  createLine,
  updateLine,
  deleteLine,
  getAllLines,
  getBalanceCtrl,
  getTotalMonthsCtrl,
  getDetailedCategories,
  getSumCategoriesCtrl,
  getSummary,
};
