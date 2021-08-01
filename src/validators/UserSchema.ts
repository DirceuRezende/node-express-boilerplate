import Joi from 'joi';
export const newUserValidator = Joi.object({
  name: Joi.string().min(3).max(255).required(),
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
  password: Joi.string().min(3).max(12).required(),
});

export const loginValidator = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: true } })
    .required(),
  password: Joi.string().min(3).max(12).required(),
});
