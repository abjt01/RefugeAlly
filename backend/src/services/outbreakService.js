const SymptomLog = require('../models/SymptomLog');
const logger = require('../utils/logger');

class OutbreakService {
  constructor() {
    this.riskThresholds = {
      low: 5,     // < 5 similar cases in 7 days
      medium: 15, // 5-15 similar cases in 7 days  
      high: 25    // > 15 similar cases in 7 days
    };
  }

  async analyzeForOutbreak(patientRecord) {
    try {
      logger.info('🧬 Analyzing potential outbreak patterns...');
      
      const location = patientRecord.location || 'unknown';
      const symptoms = patientRecord.symptoms;
      
      // Get similar cases in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const similarCases = await SymptomLog.find({
        location: location,
        timestamp: { $gte: sevenDaysAgo },
        symptoms: { $in: symptoms }
      });

      const riskLevel = this.calculateRiskLevel(similarCases.length);
      
      const analysis = {
        location,
        timeframe: '7 days',
        similarCases: similarCases.length,
        riskLevel,
        commonSymptoms: this.findCommonSymptoms(similarCases),
        recommendation: this.getRecommendation(riskLevel, symptoms),
        alertSent: riskLevel === 'high',
        timestamp: new Date()
      };

      // In production, this would trigger alerts to health authorities
      if (riskLevel === 'high') {
        this.sendOutbreakAlert(analysis);
      }

      logger.info('✅ Outbreak analysis completed:', analysis);
      return analysis;
    } catch (error) {
      logger.error('❌ Outbreak analysis failed:', error.message);
      return null;
    }
  }

  async getRegionalRisk(location) {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      const recentCases = await SymptomLog.find({
        location: location || 'unknown',
        timestamp: { $gte: sevenDaysAgo }
      });

      const riskLevel = this.calculateRiskLevel(recentCases.length);
      
      return {
        location: location || 'Unknown Region',
        riskLevel,
        totalCases: recentCases.length,
        timeframe: '7 days',
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('❌ Regional risk calculation failed:', error.message);
      return {
        location: location || 'Unknown Region',
        riskLevel: 'unknown',
        totalCases: 0,
        timeframe: '7 days',
        lastUpdated: new Date()
      };
    }
  }

  async getRegionalAnalysis(location) {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      // Get cases for trend analysis
      const monthlyData = await SymptomLog.aggregate([
        {
          $match: {
            location: location || 'unknown',
            timestamp: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$timestamp" }
            },
            count: { $sum: 1 },
            symptoms: { $push: "$symptoms" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      const recentCases = await SymptomLog.find({
        location: location || 'unknown',
        timestamp: { $gte: sevenDaysAgo }
      });

      const riskLevel = this.calculateRiskLevel(recentCases.length);
      
      return {
        location: location || 'Unknown Region',
        riskLevel,
        similarCases: recentCases.length,
        trend: this.calculateTrend(monthlyData),
        commonSymptoms: this.findCommonSymptoms(recentCases),
        recommendation: this.getRecommendation(riskLevel, []),
        lastUpdated: new Date(),
        chartData: monthlyData.map(item => ({
          date: item._id,
          cases: item.count
        }))
      };
    } catch (error) {
      logger.error('❌ Regional analysis failed:', error.message);
      return {
        location: location || 'Unknown Region',
        riskLevel: 'unknown',
        similarCases: 0,
        recommendation: 'Unable to analyze outbreak risk at this time',
        lastUpdated: new Date()
      };
    }
  }

  calculateRiskLevel(caseCount) {
    if (caseCount < this.riskThresholds.low) return 'Low';
    if (caseCount < this.riskThresholds.medium) return 'Medium'; 
    return 'High';
  }

  findCommonSymptoms(cases) {
    const symptomCounts = {};
    
    cases.forEach(case_ => {
      case_.symptoms.forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
      });
    });

    return Object.entries(symptomCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([symptom, count]) => ({ symptom, count }));
  }

  getRecommendation(riskLevel, symptoms) {
    const recommendations = {
      'Low': 'Continue monitoring. Standard precautions recommended.',
      'Medium': 'Increased surveillance recommended. Monitor for symptom clusters.',
      'High': 'Potential outbreak detected. Immediate investigation and containment measures recommended.'
    };
    
    return recommendations[riskLevel] || recommendations['Low'];
  }

  calculateTrend(monthlyData) {
    if (monthlyData.length < 2) return 'stable';
    
    const recent = monthlyData.slice(-7).reduce((sum, day) => sum + day.count, 0);
    const previous = monthlyData.slice(-14, -7).reduce((sum, day) => sum + day.count, 0);
    
    if (recent > previous * 1.5) return 'increasing';
    if (recent < previous * 0.5) return 'decreasing';
    return 'stable';
  }

  sendOutbreakAlert(analysis) {
    // In production, this would send alerts to:
    // 1. Health authorities
    // 2. NGO partners
    // 3. WHO/CDC if international
    // 4. Local refugee camp administrators
    
    logger.warn('🚨 HIGH RISK OUTBREAK ALERT:', {
      location: analysis.location,
      cases: analysis.similarCases,
      symptoms: analysis.commonSymptoms
    });
    
    // Mock alert sent
    return true;
  }
}

module.exports = new OutbreakService();
