/* eslint-disable no-unused-expressions */
const { incomes, expends, adjustments } = require('../helpers/categories');
const CurrencyMovement = require('../model/currencyMovement');
const {
  Types: { ObjectId },
} = require('mongoose');

const addLine = async (userId, body) => {
  return await CurrencyMovement.create({ ...body, owner: userId });
};

const update = async (userId, lineId, body) => {
  const updatedLine = await CurrencyMovement.findOneAndUpdate(
    {
      owner: userId,
      _id: lineId,
    },
    { ...body },
    { new: true },
  );
  return updatedLine;
};

const delLine = async (userId, lineId) => {
  const deletedLine = await CurrencyMovement.findOneAndRemove({
    owner: userId,
    _id: lineId,
  });
  if (deletedLine) {
    return { message: 'line deleted' };
  }
  return '';
};

const getAll = async (userId, query, path) => {
  const { limit = 20, page = 1, category, sortBy, sortByDesc } = query;
  const getOptions = (path, category) => {
    const searchingCategories = [];
    if (!path) {
      return {
        owner: userId,
      };
    }
    if (path === 'adjustments') {
      if (category) {
        adjustments.includes(category)
          ? searchingCategories.push(category)
          : [];
      } else {
        searchingCategories.push(...adjustments);
      }
    }
    if (path === 'incomes') {
      if (category) {
        incomes.includes(category) && searchingCategories.push(category);
      } else {
        searchingCategories.push(...incomes);
      }
    }
    if (path === 'expends') {
      if (category) {
        expends.includes(category) && searchingCategories.push(category);
      } else {
        searchingCategories.push(...expends);
      }
    }
    return {
      owner: userId,
      category: { $in: searchingCategories },
    };
  };

  const options = getOptions(path, category);
  const lines = await CurrencyMovement.paginate(options, {
    page,
    limit,
    sort: {
      ...(!sortBy && !sortByDesc ? { date: -1 } : {}),
      ...(sortBy ? { [`${sortBy}`]: 1 } : {}),
      ...(sortByDesc ? { [`${sortByDesc}`]: -1 } : {}),
    },
  });

  return lines;
};

const getTotalMonths = async userId => {
  const SummaryYear = await CurrencyMovement.aggregate([
    {
      $match: {
        owner: ObjectId(userId),
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m', date: '$date' },
        },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id',
      },
    },
    { $sort: { month: 1 } },
  ]);

  return SummaryYear;
};

const getSummaryYear = async (year, pathСheck, userId) => {
  const SummaryYear = await CurrencyMovement.aggregate([
    {
      $match: {
        owner: ObjectId(userId),
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
    { $sort: { _id: 1 } },
  ]);

  return SummaryYear;
};

const getBalance = async userId => {
  const balance = await CurrencyMovement.aggregate([
    { $match: { owner: ObjectId(userId) } },
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

const getDetailedInfoCategories = async (category, dateSplit, userId) => {
  const detailedInfoCategories = await CurrencyMovement.aggregate([
    { $match: { owner: ObjectId(userId) } },
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
    { $sort: { _id: 1 } },
  ]);

  return detailedInfoCategories;
};

const getSumCategories = async (dateSplit, validate, userId) => {
  const SumCategories = await CurrencyMovement.aggregate([
    {
      $match: {
        owner: ObjectId(userId),
        category: { $not: /adjustments/ },
      },
    },
    {
      $project: {
        month: { $month: '$date' },
        year: { $year: '$date' },
        category: '$category',
        sum: '$sum',
        categoryValidate: {
          $in: ['$category', validate ? expends : incomes],
        },
      },
    },
    {
      $match: {
        month: +dateSplit[0],
        year: +dateSplit[1],
      },
    },
    {
      $group: {
        _id: '$category',
        categoryValidate: { $first: '$categoryValidate' },
        total: { $sum: '$sum' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return SumCategories;
};

module.exports = {
  addLine,
  update,
  delLine,
  getAll,
  getTotalMonths,
  getSummaryYear,
  getBalance,
  getDetailedInfoCategories,
  getSumCategories,
};
