const { BadRequest } = require('http-errors');

const { getSummaryYear } = require('../repositories/currencyMovements');
const { monthsArray } = require('../helpers');

const getSummary = async (req, res) => {
  const pathСheck = req.path === '/summaryExpenses';

  const { year } = req.query;

  const {
    user: { id: userId },
  } = req;

  if (!year) {
    throw new BadRequest('incorrect data entry');
  }

  const response = await getSummaryYear(year, pathСheck, userId);

  for (const i in response) {
    response[i]._id = monthsArray[response[i]._id - 1];
  }

  res.status(200).json({
    status: 'success',
    code: '200',
    result: response,
  });
};

module.exports = getSummary;
