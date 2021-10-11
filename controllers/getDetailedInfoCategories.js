const { BadRequest } = require('http-errors');

const {
  getDetailedInfoCategories,
} = require('../repositories/currencyMovements');

const detailedInfoCategories = async (req, res) => {
  const { category, date } = req.query;

  const {
    user: { id: userId },
  } = req;

  if (!date) {
    throw new BadRequest();
  }
  const dateSplit = date.split('/');

  const response = await getDetailedInfoCategories(category, dateSplit, userId);

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
