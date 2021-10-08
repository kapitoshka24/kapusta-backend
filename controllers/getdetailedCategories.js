const { BadRequest } = require('http-errors');

const CurrencyMovement = require('../model/currencyMovement');

const detailedInfoCategories = async (req, res) => {
  const { date } = req.body;
  const { categories } = req.query;

  if (!date) {
    throw new BadRequest();
  }

  const dateSplit = date.split('/');

  const response = await CurrencyMovement.aggregate([
    {
      $project: {
        month: { $month: '$date' },
        year: { $year: '$date' },
        name: '$name',
        category: '$category',
        sum: '$sum',
      },
    },
    {
      $match: {
        category: categories,
        month: +dateSplit[0].replace(/^0+/, ''),
        year: +dateSplit[1],
      },
    },
    {
      $group: {
        _id: '$name',
        sum: { $sum: '$sum' },
      },
    },
  ]);

  if (response.length === 0) {
    res.status(200).json({
      status: 'no results found',
      code: 200,
      message: 'нет результатов',
    });
    return;
  }

  res.status(200).json({
    status: 'success',
    code: 200,
    response,
  });
};

module.exports = detailedInfoCategories;
