const Joi = require("joi");

// Define the schema for a single BOM progress item
const bomProgressItemSchema = Joi.object({
  bom_progress_id: Joi.number().integer().optional(), // optional for create
  bom_id: Joi.number().integer().required(),
  bom_progress_name: Joi.string().required(),
  sl_number: Joi.number().integer().required()
});

// Schema for the request body
const bomProgressListSchema = Joi.object({
  bom_progress_list: Joi.array().items(bomProgressItemSchema).min(1).required()
});

module.exports = {bomProgressListSchema}