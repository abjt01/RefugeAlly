const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
  symptoms: [{
    type: String,
    required: true
  }],
  duration: {
    type: String,
    enum: ['less-than-day', '1-3-days', '3-7-days', 'more-than-week', 'unknown'],
    default: 'unknown'
  },
  language: {
    type: String,
    enum: ['en', 'ar', 'dari'],
    default: 'en'
  },
  triageResult: {
    advice: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    }
  },
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    region: String,
    camp: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  processed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
symptomLogSchema.index({ timestamp: -1 });
symptomLogSchema.index({ 'triageResult.severity': 1 });
symptomLogSchema.index({ language: 1 });

module.exports = mongoose.model('SymptomLog', symptomLogSchema);
