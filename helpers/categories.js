const incomes = ['salary', 'otherIncome'];
const expends = [
  'products',
  'alcohol',
  'entertainment',
  'health',
  'transport',
  'housing',
  'technique',
  'utilityCommunication',
  'sportsHobbies',
  'education',
  'other',
];
const adjustments = ['adjustments'];

const categories = [...incomes, ...expends, ...adjustments];

module.exports = { incomes, expends, adjustments, categories };
