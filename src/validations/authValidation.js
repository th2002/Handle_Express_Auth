import Joi from "joi";

export const signUpBodyValidation = (body) => {
  const schema = Joi.object({
    username: Joi.string().required().trim(),
    password: Joi.string().required().trim(),
    email: Joi.string().email().required().trim(),

    // default value customer
    role: Joi.string().default("customer").empty("").trim(),
  });

  return schema.validate(body);
};

