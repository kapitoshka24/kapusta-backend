const Joi = require('joi');
const { httpCode } = require('../../../helpers/constants');

const schemaRegistrationUser = Joi.object({
  name: Joi.string()
    .min(3)
    .max(30)
    .pattern(/^\w+(?:\s+\w+)*$/)
    .default('Guest')
    .optional(),
  password: Joi.string().min(3).max(15).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),
});

const schemaLoginUser = Joi.object({
  password: Joi.string().min(3).max(15).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),
});

const validate = async (schema, obj, next, errorMsg) => {
  try {
    await schema.validateAsync(obj);
    next();
  } catch (error) {
    next({
      status: httpCode.BAD_REQUEST,
      message: errorMsg,
    });
  }
};

module.exports = {
  validationRegistrationUser: (req, _, next) => {
    return validate(
      schemaRegistrationUser,
      req.body,
      next,
      'Invalid credentials or missing required fields',
    );
  },
  validationLoginUser: (req, _, next) => {
    return validate(
      schemaLoginUser,
      req.body,
      next,
      'Invalid credentials or missing required fields',
    );
  },
};