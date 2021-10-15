const Joi = require('joi');
const { httpCode } = require('../../../helpers/constants');

const schemaRegistrationUser = Joi.object({
  name: Joi.string()
    .min(3)
    .max(40)
    .pattern(/^[A-z]+(?:\s+[A-z]+)*$|^[А-я]+(?:\s+[А-я]+)*$/)
    .default('Guest')
    .optional(),
  password: Joi.string().min(6).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),
});

const schemaLoginUser = Joi.object({
  password: Joi.string().min(6).max(30).required(),
  email: Joi.string()
    .email({
      minDomainSegments: 2,
      tlds: { allow: ['com', 'net', 'ua'] },
    })
    .required(),
});

const refreshTokensSchema = Joi.object({
  sid: Joi.string().required(),
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
  validateRefreshToken: (req, _, next) => {
    return validate(refreshTokensSchema, req.body, next, 'sid must be string');
  },
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
