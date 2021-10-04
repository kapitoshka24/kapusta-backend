const Joi = require('joi');
const { categories } = require('../../../helpers/categories.js');
const { httpCode } = require('../../../helpers/constants.js');

const currencyMovementValidateSchema = Joi.object({
  date: Joi.string().required(),
  name: Joi.string().max(40).required(),
  category: Joi.string()
    .valid(...categories)
    .required(),
  sum: Joi.number().required(),
});

const currencyMovementUpdateValidateSchema = Joi.object({
  name: Joi.string().max(40).optional(),
  sum: Joi.number().optional(),
});

const validate = async (schema, validatedValue, errMessage, next) => {
  try {
    await schema.validateAsync(validatedValue);
    next();
  } catch (err) {
    next({
      status: httpCode.BAD_REQUEST,
      message: errMessage,
    });
  }
};

module.exports = {
  validationCurrencyMovement: (req, _, next) => {
    return validate(
      currencyMovementValidateSchema,
      req.body,
      'missing required fields or value is not valid',
      next,
    );
  },
  validationUpdateSubscriptionUser: (req, _, next) => {
    return validate(
      currencyMovementUpdateValidateSchema,
      req.body,
      'missing update fields',
      next,
    );
  },
};
