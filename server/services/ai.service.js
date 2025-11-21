import MoodEntry from '../models/MoodEntry.model.js';
import JournalEntry from '../models/JournalEntry.model.js';
import Assessment from '../models/Assessment.model.js';
import ChatMessage from '../models/ChatMessage.model.js';
import Goal from '../models/Goal.model.js';
import WellnessActivity from '../models/WellnessActivity.model.js';
import AIAnalytics from '../models/AIAnalytics.model.js';

/**
 * Aggregate all user data for AI context
 */
export async function getUserContext(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const [
      moodEntries,
      journalEntries,
      assessments,
      chatMessages,
      goals,
      activities,
      previousAnalytics
    ] = await Promise.all([
      MoodEntry.find({ userId, createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).limit(100),
      JournalEntry.find({ userId, createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).limit(50),
      Assessment.find({ userId, completedAt: { $gte: startDate } }).sort({ completedAt: -1 }),
      ChatMessage.find({ userId, createdAt: { $gte: startDate } }).sort({ createdAt: -1 }).limit(200),
      Goal.find({ userId }).sort({ createdAt: -1 }),
      WellnessActivity.find({ userId, completedAt: { $gte: startDate } }),
      AIAnalytics.find({ userId, analyzedAt: { $gte: startDate } }).sort({ analyzedAt: -1 }).limit(10)
    ]);

    return {
      moodData: {
        entries: moodEntries,
        averageMood: calculateAverageMood(moodEntries),
        moodTrend: calculateMoodTrend(moodEntries),
        volatility: calculateMoodVolatility(moodEntries)
      },
      journalData: {
        entries: journalEntries,
        totalEntries: journalEntries.length,
        averageLength: journalEntries.reduce((sum, e) => sum + (e.content?.length || 0), 0) / journalEntries.length || 0,
        themes: extractJournalThemes(journalEntries)
      },
      assessmentData: {
        assessments,
        latestScores: getLatestAssessmentScores(assessments),
        trends: calculateAssessmentTrends(assessments)
      },
      chatData: {
        messages: chatMessages,
        totalMessages: chatMessages.length,
        recentTopics: extractChatTopics(chatMessages),
        sentimentHistory: chatMessages.map(m => ({ date: m.createdAt, sentiment: m.sentiment }))
      },
      goalsData: {
        goals,
        activeGoals: goals.filter(g => g.status === 'active').length,
        completedGoals: goals.filter(g => g.status === 'completed').length,
        completionRate: calculateGoalCompletionRate(goals)
      },
      activityData: {
        activities,
        totalActivities: activities.length,
        favoriteActivities: getMostFrequentActivities(activities),
        consistency: calculateActivityConsistency(activities)
      },
      analyticsHistory: previousAnalytics,
      metadata: {
        dataRange: { start: startDate, end: new Date() },
        totalDataPoints: moodEntries.length + journalEntries.length + chatMessages.length,
        userEngagement: calculateEngagementScore(moodEntries, journalEntries, chatMessages, activities)
      }
    };
  } catch (error) {
    console.error('Error aggregating user context:', error);
    throw error;
  }
}

/**
 * Perform sentiment analysis on text
 */
export function analyzeSentiment(text) {
  if (!text || text.trim().length === 0) {
    return { score: 0, label: 'neutral', confidence: 0, emotions: [] };
  }

  const lowerText = text.toLowerCase();
  
  // Sentiment keywords (simplified - in production use NLP library)
  const positiveWords = ['happy', 'joy', 'excited', 'great', 'wonderful', 'amazing', 'love', 'excellent', 'good', 'better', 'best', 'grateful', 'thankful', 'blessed', 'peaceful', 'calm', 'hopeful', 'optimistic'];
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'scared', 'angry', 'frustrated', 'hopeless', 'terrible', 'awful', 'bad', 'worse', 'worst', 'hate', 'pain', 'hurt', 'lonely', 'isolated'];
  const crisisWords = ['suicide', 'kill myself', 'end it all', 'no point', 'give up', 'self-harm', 'hurt myself', 'die', 'death wish'];

  let positiveCount = 0;
  let negativeCount = 0;
  let crisisCount = 0;

  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    positiveCount += (lowerText.match(regex) || []).length;
  });

  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    negativeCount += (lowerText.match(regex) || []).length;
  });

  crisisWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    crisisCount += (lowerText.match(regex) || []).length;
  });

  const totalWords = text.split(/\s+/).length;
  const sentimentScore = (positiveCount - negativeCount) / Math.max(totalWords, 1);
  const normalizedScore = Math.max(-1, Math.min(1, sentimentScore * 5));

  let label;
  if (normalizedScore > 0.5) label = 'very-positive';
  else if (normalizedScore > 0.1) label = 'positive';
  else if (normalizedScore > -0.1) label = 'neutral';
  else if (normalizedScore > -0.5) label = 'negative';
  else label = 'very-negative';

  const emotions = [];
  if (lowerText.includes('happy') || lowerText.includes('joy')) emotions.push({ emotion: 'joy', score: 0.8 });
  if (lowerText.includes('sad') || lowerText.includes('depressed')) emotions.push({ emotion: 'sadness', score: 0.8 });
  if (lowerText.includes('anxious') || lowerText.includes('worried')) emotions.push({ emotion: 'anxiety', score: 0.8 });
  if (lowerText.includes('angry') || lowerText.includes('frustrated')) emotions.push({ emotion: 'anger', score: 0.7 });
  if (lowerText.includes('scared') || lowerText.includes('fear')) emotions.push({ emotion: 'fear', score: 0.7 });

  return {
    score: normalizedScore,
    label,
    confidence: Math.min(0.95, (positiveCount + negativeCount) / totalWords * 2),
    emotions,
    crisisIndicators: crisisCount > 0
  };
}

/**
 * Assess crisis risk based on user context
 */
export async function assessCrisisRisk(userId, userContext) {
  const indicators = [];
  let riskScore = 0;

  // Check mood patterns
  if (userContext.moodData.averageMood < 3) {
    indicators.push({ type: 'low-mood', severity: 'moderate', detected: true });
    riskScore += 15;
  }
  if (userContext.moodData.volatility > 2) {
    indicators.push({ type: 'mood-volatility', severity: 'moderate', detected: true });
    riskScore += 10;
  }

  // Check assessment scores
  const latestPHQ9 = userContext.assessmentData.latestScores.phq9;
  const latestGAD7 = userContext.assessmentData.latestScores.gad7;
  
  if (latestPHQ9 && latestPHQ9.totalScore > 15) {
    indicators.push({ type: 'severe-depression', severity: 'high', detected: true });
    riskScore += 30;
  } else if (latestPHQ9 && latestPHQ9.totalScore > 10) {
    indicators.push({ type: 'moderate-depression', severity: 'moderate', detected: true });
    riskScore += 20;
  }

  if (latestGAD7 && latestGAD7.totalScore > 15) {
    indicators.push({ type: 'severe-anxiety', severity: 'high', detected: true });
    riskScore += 25;
  }

  // Check journal sentiment
  const recentJournals = userContext.journalData.entries.slice(0, 10);
  const negativeSentimentCount = recentJournals.filter(j => {
    const sentiment = analyzeSentiment(j.content);
    return sentiment.crisisIndicators || sentiment.score < -0.5;
  }).length;

  if (negativeSentimentCount > 5) {
    indicators.push({ type: 'persistent-negative-thoughts', severity: 'high', detected: true });
    riskScore += 25;
  }

  // Check engagement drop
  if (userContext.metadata.userEngagement < 30) {
    indicators.push({ type: 'low-engagement', severity: 'moderate', detected: true });
    riskScore += 15;
  }

  // Check social isolation
  if (userContext.activityData.totalActivities < 5 && userContext.chatData.totalMessages < 10) {
    indicators.push({ type: 'social-withdrawal', severity: 'moderate', detected: true });
    riskScore += 15;
  }

  // Determine risk level
  let level, requiresIntervention;
  if (riskScore >= 70) {
    level = 'critical';
    requiresIntervention = true;
  } else if (riskScore >= 50) {
    level = 'high';
    requiresIntervention = true;
  } else if (riskScore >= 30) {
    level = 'moderate';
    requiresIntervention = false;
  } else if (riskScore >= 15) {
    level = 'low';
    requiresIntervention = false;
  } else {
    level = 'none';
    requiresIntervention = false;
  }

  const recommendations = generateCrisisRecommendations(level, indicators);

  // Save analytics
  await AIAnalytics.create({
    userId,
    type: 'crisis-risk',
    crisisRisk: {
      level,
      score: riskScore,
      indicators,
      recommendations,
      requiresIntervention,
      lastAssessed: new Date()
    },
    sourceData: {
      moodEntries: userContext.moodData.entries.length,
      journalEntries: userContext.journalData.entries.length,
      chatMessages: userContext.chatData.messages.length,
      assessmentScores: userContext.assessmentData.latestScores
    },
    dataRange: userContext.metadata.dataRange
  });

  return {
    level,
    score: riskScore,
    indicators,
    recommendations,
    requiresIntervention
  };
}

/**
 * Generate personalized AI response with full context
 */
export async function generatePersonalizedResponse(userId, userMessage, userContext) {
  // Analyze sentiment of user message
  const sentiment = analyzeSentiment(userMessage);

  // Build context summary for AI
  const contextSummary = {
    recentMood: userContext.moodData.averageMood,
    moodTrend: userContext.moodData.moodTrend,
    assessmentScores: userContext.assessmentData.latestScores,
    activeGoals: userContext.goalsData.activeGoals,
    recentTopics: userContext.chatData.recentTopics,
    crisisRisk: await assessCrisisRisk(userId, userContext),
    userEngagement: userContext.metadata.userEngagement
  };

  // This would integrate with Gemini AI in production
  // For now, return structured response
  return {
    message: userMessage,
    sentiment,
    context: contextSummary,
    personalized: true,
    language: 'en'
  };
}

// Helper functions
function calculateAverageMood(entries) {
  if (entries.length === 0) return 5;
  return entries.reduce((sum, e) => sum + e.mood, 0) / entries.length;
}

function calculateMoodTrend(entries) {
  if (entries.length < 2) return 'stable';
  const recent = entries.slice(0, 7);
  const older = entries.slice(7, 14);
  const recentAvg = recent.reduce((sum, e) => sum + e.mood, 0) / recent.length;
  const olderAvg = older.reduce((sum, e) => sum + e.mood, 0) / older.length || recentAvg;
  const diff = recentAvg - olderAvg;
  if (diff > 0.5) return 'improving';
  if (diff < -0.5) return 'declining';
  return 'stable';
}

function calculateMoodVolatility(entries) {
  if (entries.length < 2) return 0;
  const moods = entries.map(e => e.mood);
  const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
  const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - avg, 2), 0) / moods.length;
  return Math.sqrt(variance);
}

function extractJournalThemes(entries) {
  const themes = {};
  entries.forEach(entry => {
    if (entry.tags) {
      entry.tags.forEach(tag => {
        themes[tag] = (themes[tag] || 0) + 1;
      });
    }
  });
  return Object.entries(themes).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([theme]) => theme);
}

function getLatestAssessmentScores(assessments) {
  const scores = {};
  ['phq9', 'gad7', 'stress', 'burnout'].forEach(type => {
    const latest = assessments.find(a => a.type === type);
    if (latest) scores[type] = latest;
  });
  return scores;
}

function calculateAssessmentTrends(assessments) {
  const trends = {};
  ['phq9', 'gad7', 'stress'].forEach(type => {
    const typeAssessments = assessments.filter(a => a.type === type).slice(0, 5);
    if (typeAssessments.length >= 2) {
      const recent = typeAssessments[0].totalScore;
      const older = typeAssessments[typeAssessments.length - 1].totalScore;
      trends[type] = recent < older ? 'improving' : recent > older ? 'worsening' : 'stable';
    }
  });
  return trends;
}

function extractChatTopics(messages) {
  const topics = {};
  messages.forEach(msg => {
    if (msg.topic) topics[msg.topic] = (topics[msg.topic] || 0) + 1;
  });
  return Object.keys(topics).slice(0, 5);
}

function calculateGoalCompletionRate(goals) {
  if (goals.length === 0) return 0;
  const completed = goals.filter(g => g.status === 'completed').length;
  return (completed / goals.length) * 100;
}

function getMostFrequentActivities(activities) {
  const counts = {};
  activities.forEach(a => {
    counts[a.activityId] = (counts[a.activityId] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([id]) => id);
}

function calculateActivityConsistency(activities) {
  if (activities.length < 7) return 'low';
  const daysWithActivity = new Set(activities.map(a => new Date(a.completedAt).toDateString())).size;
  if (daysWithActivity >= 20) return 'high';
  if (daysWithActivity >= 10) return 'moderate';
  return 'low';
}

function calculateEngagementScore(moods, journals, chats, activities) {
  return (moods.length * 2) + (journals.length * 5) + (chats.length * 1) + (activities.length * 3);
}

function generateCrisisRecommendations(level, indicators) {
  const recommendations = [];
  
  if (level === 'critical' || level === 'high') {
    recommendations.push('Contact a mental health professional immediately');
    recommendations.push('Reach out to a trusted friend or family member');
    recommendations.push('Call a crisis helpline: 988 (US) or local emergency services');
  }
  
  if (indicators.some(i => i.type === 'severe-depression')) {
    recommendations.push('Consider scheduling a therapy session');
    recommendations.push('Practice self-care activities daily');
  }
  
  if (indicators.some(i => i.type === 'social-withdrawal')) {
    recommendations.push('Try to connect with at least one person today');
    recommendations.push('Join a support group or community activity');
  }
  
  recommendations.push('Continue tracking your mood and feelings');
  recommendations.push('Use the wellness activities for immediate relief');
  
  return recommendations;
}

export default {
  getUserContext,
  analyzeSentiment,
  assessCrisisRisk,
  generatePersonalizedResponse
};
