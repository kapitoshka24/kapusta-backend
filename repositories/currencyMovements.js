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

const getAll = async (query, path) => {
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

  const options = path ? { category: { $in: checkType(path) } } : '';

  const lines = await CurrencyMovement.paginate(options, {
    page,
    limit,
    sort: {
      date: -1,
    },
  });

  return lines;
};

const getSummaryYear = async (year, pathСheck) => {
  const SummaryYear = await CurrencyMovement.aggregate([
    {
      $match: {
        date: {
          $gte: new Date(`${+year}-01-01`),
          $lt: new Date(`${+year + 1}-01-01`),
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

  return SummaryYear;
};

const getBalance = async () => {
  const balance = await CurrencyMovement.aggregate([
    // { $match: { category: { $not: /adjustments/ } } },
    {
      $project: {
        category: {
          $in: ['$category', expends],
        },
        sum: '$sum',
      },
    },
    {
      $group: {
        _id: '$category',

        total: { $sum: '$sum' },
      },
    },
    {
      $project: {
        _id: 0,
        totals: {
          $cond: {
            if: '$_id',
            then: {
              expends: '$total',
            },
            else: {
              incomes: '$total',
            },
          },
        },
      },
    },
  ]);
  return balance.reduce((acc, { totals }) => {
    return totals.expends ? acc - totals.expends : acc + totals.incomes;
  }, 0);
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
  getAll,
  getSummaryYear,
  getBalance,
  getDetailedInfoCategories,
};
