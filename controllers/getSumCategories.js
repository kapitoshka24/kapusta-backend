const { BadRequest } = require('http-errors');
const { getSumCategories } = require('../repositories/currencyMovements');

const SumCategories = async (req, res) => {
  const { date } = req.query;
  const pathСheck = req.path === '/sumCategoryExpenses';

  if (!date) {
    throw new BadRequest();
  }

  const dateSplit = date.split('/');

  const response = await getSumCategories(dateSplit, pathСheck);

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

module.exports = SumCategories;
