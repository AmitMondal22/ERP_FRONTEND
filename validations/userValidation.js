const Joi = require("joi");


class UserValidation{
    
//  createUserSchema = Joi.object({
//   name: Joi.string().min(2).max(50).required(),
//   email: Joi.string().email().required(),
//   password: Joi.string().min(6).pattern(/[0-9]/).required(),
//   mobile_no: Joi.string().pattern(/^[0-9]{10}$/).required(),
//   role: Joi.string().valid("admin", "user", "subadmin").required(),
// });

createUserSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      "string.base": "Name must be a text value",
      "string.min": "Name must be at least 3 characters",
      "string.max": "Name cannot exceed 50 characters",
      "any.required": "Name is required"
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Email must be valid",
      "any.required": "Email is required"
    }),

  mobile_no: Joi.string()
    .pattern(/^[0-9]{10}$/) 
    .required()
    .messages({
      "string.pattern.base": "Mobile number must be a valid 10-digit number",
      "any.required": "Mobile number is required"
    }),

  password: Joi.string()
    .min(6)
    .max(30)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 30 characters",
      "any.required": "Password is required"
    }),

  role: Joi.string()
    .valid("SA", "Admin", "User") // adjust roles as per your project
    .default("User")
    .messages({
      "any.only": "Role must be one of SA, Admin, or User"
    })
});



loginSchema = Joi.object({

  username: Joi.string().email().required().messages({
    'string.email': 'Email must be valid',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required'
  })
});



};


module.exports =new  UserValidation();
