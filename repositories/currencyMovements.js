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

const getAllLines = async query => {
  const { limit = 20, page = 1, type } = query;

  const checkType = type => {
    if (type === 'incomes') {
      return incomes;
    }
    if (type === 'expends') {
      return expends;
    }
    if (type === 'adjustments') {
      return adjustments;
    }
  };

  const options = { category: { $in: checkType(type) } };

  const lines = await CurrencyMovement.paginate(options, {
    page,
    limit,
    sort: {
      date: -1,
    },
  });

  return lines;
};

module.exports = { addLine, update, delLine, getAllLines };
