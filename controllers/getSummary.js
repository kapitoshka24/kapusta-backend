const CurrencyMovement = require('../model/currencyMovement');

const { incomes } = require('../helpers/categories');

const getSummary = async (req, res) => {
  const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
  ];

  const summaryIncome = [];

  for (let i = 1; i < 13; i++) {
    const monthlyExpenses = await CurrencyMovement.aggregate([
      {
        $project: {
          _id: 1,
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          category: {
            $in: ['$category', incomes],
          },
          sum: 1,
        },
      },
      {
        $group: {
          _id: {
            year: '$year',
            month: '$month',
            day: '$day',
            category: '$category',
          },
          sum: { $sum: '$sum' },
        },
      },
      { $match: { '_id.year': 2021, '_id.month': i, '_id.category': true } },
      {
        $group: {
          _id: i,
          sum: { $sum: '$sum' },
        },
      },
    ]);

    const month = i;

    const updatedArray = {
      month: months[month - 1],
      sum: 0,
      ...monthlyExpenses[0],
    };
    delete updatedArray._id;

    summaryIncome.push(updatedArray);
  }
  console.log(summaryIncome);

  res.status(200).json({
    status: 'success',
    code: '202',
    result: summaryIncome,
  });
};

module.exports = getSummary;
