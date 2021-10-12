const Joi = require('joi');
const { categories } = require('../../../helpers/categories.js');
const { httpCode } = require('../../../helpers/constants.js');

const dateValidation = `1-1-${new Date().getFullYear()}`;

const currencyMovementValidateSchema = Joi.object({
  date: Joi.date().greater(dateValidation).required(),
  name: Joi.string().max(40).required(),
  category: Joi.string()
    .valid(...categories)
    .required(),
  sum: Joi.number().min(0).required(),
});

const currencyMovementUpdateValidateSchema = Joi.object({
  name: Joi.string().max(40).optional(),
  sum: Joi.number().min(0).optional(),
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
      'Missing required fields or value is not valid',
      next,
    );
  },
  validationUpdateCurrencyMovement: (req, _, next) => {
    return validate(
      currencyMovementUpdateValidateSchema,
      req.body,
      'Value is not valid',
      next,
    );
  },
};
