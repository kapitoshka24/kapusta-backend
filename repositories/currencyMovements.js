const { incomes, expends, adjustments } = require('../helpers/categories');
const CurrencyMovement = require('../model/currencyMovement');

const addLine = async body => {
  return await CurrencyMovement.create({ ...body });
};

const update = async (lineId, body) => {
  const updatedLine = await CurrencyMovement.findOneAndUpdate(
    {
      _id: lineId,
    },
    { ...body },
    { new: true },
  );
  return updatedLine;
};

const delLine = async lineId => {
  const deletedLine = await CurrencyMovement.findOneAndRemove({
    _id: lineId,
  });
  if (deletedLine) {
    return { message: 'line deleted' };
  }
  return '';
};

const getAllLines = async (query, path) => {
  const { limit = 20, page = 1 } = query;

  const checkType = path => {
    if (path === 'incomes') {
      return incomes;
    }
    if (path === 'expends') {
      return expends;
    }
    if (path === 'adjustments') {
      return adjustments;
    }
  };

  const options = { category: { $in: checkType(path) } };

  const lines = await CurrencyMovement.paginate(options, {
    page,
    limit,
    sort: {
      date: -1,
    },
  });

  return lines;
};

const getDetailedInfoCategories = async (category, dateSplit) => {
  const detailedInfoCategories = await CurrencyMovement.aggregate([
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
        category: category,
        month: +dateSplit[0],
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

  return detailedInfoCategories;
};

module.exports = {
  addLine,
  update,
  delLine,
  getAllLines,
  getDetailedInfoCategories,
};
