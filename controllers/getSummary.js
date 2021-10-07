const CurrencyMovement = require('../model/currencyMovement');

const { incomes } = require('../helpers/categories');
const { expends } = require('../helpers/categories');

const { monthsArray } = require('../helpers');

const getSummary = async (req, res) => {
  const pathСheck =
    req.originalUrl === '/api/currencymovements/summaryExpenses';

  const response = await CurrencyMovement.aggregate([
    {
      $match: {
        date: {
          $gte: new Date('2021-01-01'),
          $lt: new Date('2022-01-01'),
        },
      },
    },
    {
      $project: {
        date: '$date',
        sum: '$sum',
        category: {
          $in: ['$category', pathСheck ? expends : incomes],
        },
      },
    },
    { $match: { category: true } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%m', date: '$date' },
        },
        total: { $sum: '$sum' },
      },
    },
  ]);

  for (let i in response) {
    response[i]._id = monthsArray[response[i]._id - 1];
  }

  res.status(200).json({
    status: 'success',
    code: '202',
    result: response,
  });
};

module.exports = getSummary;
