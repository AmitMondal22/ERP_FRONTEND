const Joi = require('joi');

// Joi schema for purchase validation
const purchaseSchema = Joi.object({
  project_id: Joi.number().integer().required().messages({
    'number.base': 'Project ID must be a number',
    'number.integer': 'Project ID must be an integer',
    'any.required': 'Project ID is required',
  }),
  site_id: Joi.number().integer().required().messages({
    'number.base': 'Site ID must be a number',
    'number.integer': 'Site ID must be an integer',
    'any.required': 'Site ID is required',
  }),
  vendor_id: Joi.number().integer().required().messages({
    'number.base': 'Vendor ID must be a number',
    'number.integer': 'Vendor ID must be an integer',
    'any.required': 'Vendor ID is required',
  }),
  stor_id: Joi.number().integer().required().messages({
    'number.base': 'Store ID must be a number',
    'number.integer': 'Store ID must be an integer',
    'any.required': 'Store ID is required',
  }),
  purchase_order_id: Joi.number().integer().required().messages({
    'number.base': 'Purchase Order ID must be a number',
    'number.integer': 'Purchase Order ID must be an integer',
    'any.required': 'Purchase Order ID is required',
  }),
  invoice_no: Joi.string().max(50).trim().required().messages({
    'string.base': 'Invoice number must be a string',
    'string.max': 'Invoice number must not exceed 50 characters',
    'string.empty': 'Invoice number is required',
    'any.required': 'Invoice number is required',
  }),
  invoice_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
        'string.pattern.base': 'Invoice date must be in YYYY-MM-DD format',
        'any.required': 'Invoice date is required',
    }),
delivery_date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
        'string.pattern.base': 'Delivery date must be in YYYY-MM-DD format',
        'any.required': 'Delivery date is required',
    }),
  invoice_image: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .allow('')
    .optional()
    .messages({
      'string.uri': 'Invoice image must be a valid URL (http or https)',
    }),
  transport_insurance: Joi.string().max(255).trim().allow('').optional().messages({
    'string.base': 'Transport insurance must be a string',
    'string.max': 'Transport insurance must not exceed 255 characters',
  }),
  remarks: Joi.string().max(500).trim().allow('').optional().messages({
    'string.base': 'Remarks must be a string',
    'string.max': 'Remarks must not exceed 500 characters',
  }),
  created_by: Joi.number().integer().required().messages({
    'number.base': 'Created by must be a number',
    'number.integer': 'Created by must be an integer',
    'any.required': 'Created by is required',
  }),
  purchase_product: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.number().integer().required().messages({
          'number.base': 'Product ID must be a number',
          'number.integer': 'Product ID must be an integer',
          'any.required': 'Product ID is required',
        }),
        product_qty: Joi.number().positive().required().messages({
          'number.base': 'Product quantity must be a number',
          'number.positive': 'Product quantity must be greater than 0',
          'any.required': 'Product quantity is required',
        }),
        invoice_qty: Joi.number().positive().required().messages({
          'number.base': 'Invoice quantity must be a number',
          'number.positive': 'Invoice quantity must be greater than 0',
          'any.required': 'Invoice quantity is required',
        }),
        unit_rate: Joi.number().positive().required().messages({
          'number.base': 'Unit rate must be a number',
          'number.positive': 'Unit rate must be greater than 0',
          'any.required': 'Unit rate is required',
        }),
        discount_rate: Joi.number().min(0).max(100).default(0).optional().messages({
          'number.base': 'Discount rate must be a number',
          'number.min': 'Discount rate must be at least 0',
          'number.max': 'Discount rate must not exceed 100',
        }),
        discount_amount: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'Discount amount must be a number',
          'number.min': 'Discount amount must be at least 0',
        }),
        sgst_rate: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'SGST rate must be a number',
          'number.min': 'SGST rate must be at least 0',
        }),
        cgst_rate: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'CGST rate must be a number',
          'number.min': 'CGST rate must be at least 0',
        }),
        igst_rate: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'IGST rate must be a number',
          'number.min': 'IGST rate must be at least 0',
        }),
        sgst_amt: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'SGST amount must be a number',
          'number.min': 'SGST amount must be at least 0',
        }),
        cgst_amt: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'CGST amount must be a number',
          'number.min': 'CGST amount must be at least 0',
        }),
        igst_amt: Joi.number().min(0).default(0).optional().messages({
          'number.base': 'IGST amount must be a number',
          'number.min': 'IGST amount must be at least 0',
        }),
        total_amount: Joi.number().positive().required().messages({
          'number.base': 'Total amount must be a number',
          'number.positive': 'Total amount must be greater than 0',
          'any.required': 'Total amount is required',
        }),
        make_date: Joi.string()
          .pattern(/^\d{4}-\d{2}-\d{2}$/)
          .allow(null)
          .optional()
          .messages({
              'string.pattern.base': 'Make date must be in YYYY-MM-DD format',
          }),

        ownership_status: Joi.string().max(50).trim().allow('').optional().messages({
          'string.base': 'Ownership status must be a string',
          'string.max': 'Ownership status must not exceed 50 characters',
        }),
        created_by: Joi.number().integer().required().messages({
          'number.base': 'Created by must be a number',
          'number.integer': 'Created by must be an integer',
          'any.required': 'Created by is required',
        }),
      }).custom((value, helpers) => {
        // Custom validation for tax fields consistency
        const { sgst_rate, cgst_rate, igst_rate, sgst_amt, cgst_amt, igst_amt } = value;
        if ((sgst_rate > 0 || sgst_amt > 0) && (cgst_rate === 0 && cgst_amt === 0)) {
          return helpers.error('any.custom', { message: 'CGST rate and amount must be provided if SGST is provided' });
        }
        if ((cgst_rate > 0 || cgst_amt > 0) && (sgst_rate === 0 && sgst_amt === 0)) {
          return helpers.error('any.custom', { message: 'SGST rate and amount must be provided if CGST is provided' });
        }
        if ((igst_rate > 0 || igst_amt > 0) && (sgst_rate > 0 || cgst_rate > 0)) {
          return helpers.error('any.custom', { message: 'IGST cannot be provided with SGST or CGST' });
        }

        // Custom validation for discount consistency
        const { unit_rate, product_qty, discount_rate, discount_amount, total_amount } = value;
       const calculatedDiscount = discount_rate 
          ? (unit_rate * product_qty * discount_rate) / 100 
          : discount_amount;
        const expectedTotal = unit_rate * product_qty - calculatedDiscount + (sgst_amt + cgst_amt + igst_amt);
        if (Math.abs(total_amount - expectedTotal) > 0.01) {
          return helpers.error('any.custom', { message: 'Total amount does not match calculated amount' });
        }

        return value;
      }, 'Tax and Discount Validation')
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one product is required',
      'any.required': 'Purchase products are required',
    }),
});



const purchaseQuerySchema = Joi.object({
  search: Joi.string().allow('', null),
  fromDate: Joi.date().iso().allow('', null),
  toDate: Joi.date().iso().allow('', null)
});

module.exports = { purchaseSchema, purchaseQuerySchema };