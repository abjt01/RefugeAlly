const Joi = require('joi');

const triageInputSchema = Joi.object({
  symptoms: Joi.alternatives().try(
    Joi.string().min(1).max(1000),
    Joi.array().items(Joi.string().min(1).max(200)).min(1).max(20)
  ).required(),
  
  duration: Joi.string().valid(
    'less-than-day', '1-3-days', '3-7-days', 'more-than-week', 'unknown'
  ).default('unknown'),
  
  language: Joi.string().valid('en', 'ar', 'dari').default('en'),
  
  timestamp: Joi.string().optional(),
  
  // Allow additional fields without failing
}).unknown(true);

const validateTriageInput = (data) => {
  return triageInputSchema.validate(data, { 
    allowUnknown: true,
    stripUnknown: false 
  });
};

module.exports = { validateTriageInput };
