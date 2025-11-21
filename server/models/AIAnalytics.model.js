import mongoose from 'mongoose';

const aiAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['sentiment', 'crisis-risk', 'mood-pattern', 'behavior-insight'],
    required: true
  },
  // Sentiment Analysis
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['very-negative', 'negative', 'neutral', 'positive', 'very-positive']
    },
    confidence: Number,
    emotions: [{
      emotion: String,
      score: Number
    }]
  },
  // Crisis Risk Assessment
  crisisRisk: {
    level: {
      type: String,
      enum: ['none', 'low', 'moderate', 'high', 'critical']
    },
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    indicators: [{
      type: String,
      severity: String,
      detected: Boolean
    }],
    recommendations: [String],
    requiresIntervention: Boolean,
    lastAssessed: Date
  },
  // Context Data
  sourceData: {
    moodEntries: Number,
    journalEntries: Number,
    chatMessages: Number,
    assessmentScores: mongoose.Schema.Types.Mixed,
    activityLevel: String,
    sleepQuality: String,
    socialEngagement: String
  },
  // Analysis Results
  insights: [{
    category: String,
    insight: String,
    confidence: Number,
    actionable: Boolean
  }],
  patterns: [{
    type: String,
    description: String,
    frequency: String,
    trend: String
  }],
  // Recommendations
  recommendations: [{
    type: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent']
    },
    action: String,
    reason: String
  }],
  analyzedAt: {
    type: Date,
    default: Date.now
  },
  dataRange: {
    start: Date,
    end: Date
  }
}, {
  timestamps: true
});

// Indexes
aiAnalyticsSchema.index({ userId: 1, type: 1, analyzedAt: -1 });
aiAnalyticsSchema.index({ 'crisisRisk.level': 1, 'crisisRisk.requiresIntervention': 1 });

export default mongoose.model('AIAnalytics', aiAnalyticsSchema);
