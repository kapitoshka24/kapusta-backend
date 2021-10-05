const incomes = ['salary', 'other-income'];
const expends = [
  'products',
  'alcohol',
  'entertainment',
  'health',
  'transport',
  'housing',
  'technique',
  'utility-communication',
  'sports-hobbies',
  'education',
  'other',
];
const adjustments = ['adjustments'];

const categories = [...incomes, ...expends, ...adjustments];

module.exports = { incomes, expends, adjustments, categories };
