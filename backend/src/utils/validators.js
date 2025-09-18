const Joi = require('joi');

const triageInputSchema = Joi.object({
  symptoms: Joi.alternatives().try(
    Joi.string().min(3).max(500),
    Joi.array().items(Joi.string().min(1).max(100)).min(1).max(10)
  ).required(),
  
  duration: Joi.string().valid(
    'less-than-day', '1-3-days', '3-7-days', 'more-than-week', 'unknown'
  ).default('unknown'),
  
  language: Joi.string().valid('en', 'ar', 'dari').default('en'),
  
  location: Joi.object({
    camp: Joi.string().max(100),
    region: Joi.string().max(100),
    country: Joi.string().max(100)
  }).optional()
});

const validateTriageInput = (data) => {
  return triageInputSchema.validate(data, { allowUnknown: false });
};

module.exports = {
  validateTriageInput
};
