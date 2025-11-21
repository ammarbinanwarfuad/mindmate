import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getUserContext, analyzeSentiment, assessCrisisRisk, generatePersonalizedResponse } from '../services/ai.service.js';
import AIAnalytics from '../models/AIAnalytics.model.js';

const router = express.Router();

/**
 * @route   POST /api/ai/analyze-sentiment
 * @desc    Analyze sentiment of text
 * @access  Private
 */
router.post('/analyze-sentiment', authenticate, async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }

    const sentiment = analyzeSentiment(text);

    // Save analytics
    await AIAnalytics.create({
      userId: req.user._id,
      type: 'sentiment',
      sentiment,
      analyzedAt: new Date()
    });

    res.json({ success: true, sentiment });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/ai/crisis-assessment
 * @desc    Assess user's crisis risk
 * @access  Private
 */
router.get('/crisis-assessment', authenticate, async (req, res) => {
  try {
    // Get comprehensive user context
    const userContext = await getUserContext(req.user._id, 30);
    
    // Assess crisis risk
    const crisisAssessment = await assessCrisisRisk(req.user._id, userContext);

    res.json({ 
      success: true, 
      assessment: crisisAssessment,
      context: {
        moodTrend: userContext.moodData.moodTrend,
        recentAssessments: userContext.assessmentData.latestScores,
        engagement: userContext.metadata.userEngagement
      }
    });
  } catch (error) {
    console.error('Crisis assessment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai/personalized-chat
 * @desc    Get personalized AI response with full context
 * @access  Private
 */
router.post('/personalized-chat', authenticate, async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Get user context
    const userContext = await getUserContext(req.user._id, 30);
    
    // Generate personalized response
    const response = await generatePersonalizedResponse(req.user._id, message, userContext);

    // Translate if needed
    let translatedResponse = response;
    if (language !== 'en') {
      translatedResponse = await translateResponse(response, language);
    }

    res.json({ 
      success: true, 
      response: translatedResponse,
      userContext: {
        moodAverage: userContext.moodData.averageMood,
        moodTrend: userContext.moodData.moodTrend,
        crisisRisk: response.context.crisisRisk.level,
        activeGoals: userContext.goalsData.activeGoals
      }
    });
  } catch (error) {
    console.error('Personalized chat error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/ai/user-insights
 * @desc    Get AI-generated insights about user
 * @access  Private
 */
router.get('/user-insights', authenticate, async (req, res) => {
  try {
    const userContext = await getUserContext(req.user._id, 30);

    const insights = {
      moodInsights: {
        average: userContext.moodData.averageMood,
        trend: userContext.moodData.moodTrend,
        volatility: userContext.moodData.volatility,
        interpretation: interpretMoodData(userContext.moodData)
      },
      behaviorInsights: {
        journalingFrequency: userContext.journalData.totalEntries,
        activityLevel: userContext.activityData.consistency,
        socialEngagement: userContext.chatData.totalMessages > 50 ? 'high' : 'moderate',
        interpretation: interpretBehaviorData(userContext)
      },
      mentalHealthInsights: {
        assessmentScores: userContext.assessmentData.latestScores,
        trends: userContext.assessmentData.trends,
        interpretation: interpretAssessmentData(userContext.assessmentData)
      },
      recommendations: generatePersonalizedRecommendations(userContext),
      strengths: identifyUserStrengths(userContext),
      areasForGrowth: identifyGrowthAreas(userContext)
    };

    // Save insights
    await AIAnalytics.create({
      userId: req.user._id,
      type: 'behavior-insight',
      insights: Object.entries(insights).map(([category, data]) => ({
        category,
        insight: JSON.stringify(data),
        confidence: 0.85,
        actionable: true
      })),
      sourceData: {
        moodEntries: userContext.moodData.entries.length,
        journalEntries: userContext.journalData.entries.length,
        chatMessages: userContext.chatData.messages.length
      },
      dataRange: userContext.metadata.dataRange
    });

    res.json({ success: true, insights });
  } catch (error) {
    console.error('User insights error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/ai/analytics-history
 * @desc    Get user's AI analytics history
 * @access  Private
 */
router.get('/analytics-history', authenticate, async (req, res) => {
  try {
    const { type, limit = 20 } = req.query;
    
    const query = { userId: req.user._id };
    if (type) query.type = type;

    const analytics = await AIAnalytics.find(query)
      .sort({ analyzedAt: -1 })
      .limit(parseInt(limit));

    res.json({ success: true, analytics });
  } catch (error) {
    console.error('Analytics history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai/voice-to-text
 * @desc    Convert voice to text (placeholder for voice AI)
 * @access  Private
 */
router.post('/voice-to-text', authenticate, async (req, res) => {
  try {
    const { language = 'en' } = req.body;

    // In production, this would use speech-to-text API
    // For now, return mock response
    const transcription = {
      text: "This is a mock transcription of your voice message.",
      confidence: 0.95,
      language,
      duration: 5.2
    };

    res.json({ success: true, transcription });
  } catch (error) {
    console.error('Voice to text error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/ai/text-to-voice
 * @desc    Convert text to voice (placeholder for voice AI)
 * @access  Private
 */
router.post('/text-to-voice', authenticate, async (req, res) => {
  try {
    const { text, language = 'en', voice = 'default' } = req.body;

    // In production, this would use text-to-speech API
    const audioResponse = {
      audioUrl: 'https://example.com/audio/response.mp3',
      duration: text.length * 0.1,
      language,
      voice
    };

    res.json({ success: true, audio: audioResponse });
  } catch (error) {
    console.error('Text to voice error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper functions
function interpretMoodData(moodData) {
  const avg = moodData.averageMood;
  if (avg >= 7) return 'Your mood has been consistently positive. Keep up the good work!';
  if (avg >= 5) return 'Your mood is generally stable. Consider activities to boost it further.';
  if (avg >= 3) return 'Your mood has been lower than usual. Consider reaching out for support.';
  return 'Your mood indicates you may be struggling. Please consider professional help.';
}

function interpretBehaviorData(context) {
  const insights = [];
  if (context.journalData.totalEntries > 20) {
    insights.push('You\'re doing great with journaling! This is an excellent self-reflection habit.');
  }
  if (context.activityData.consistency === 'high') {
    insights.push('Your wellness activity consistency is impressive!');
  }
  if (context.goalsData.completionRate > 70) {
    insights.push('You\'re achieving most of your goals. Great progress!');
  }
  return insights.join(' ');
}

function interpretAssessmentData(assessmentData) {
  const interpretations = [];
  const { phq9, gad7 } = assessmentData.latestScores;
  
  if (phq9 && phq9.totalScore < 5) {
    interpretations.push('Your depression screening shows minimal symptoms.');
  } else if (phq9 && phq9.totalScore >= 15) {
    interpretations.push('Your depression screening indicates you may benefit from professional support.');
  }
  
  if (gad7 && gad7.totalScore < 5) {
    interpretations.push('Your anxiety levels appear well-managed.');
  }
  
  return interpretations.join(' ') || 'Continue monitoring your mental health with regular assessments.';
}

function generatePersonalizedRecommendations(context) {
  const recommendations = [];
  
  if (context.moodData.averageMood < 5) {
    recommendations.push({
      type: 'mood-boost',
      priority: 'high',
      action: 'Try a 10-minute meditation or breathing exercise',
      reason: 'Your mood has been lower recently'
    });
  }
  
  if (context.activityData.totalActivities < 10) {
    recommendations.push({
      type: 'wellness',
      priority: 'medium',
      action: 'Complete at least one wellness activity today',
      reason: 'Regular wellness activities can significantly improve mood'
    });
  }
  
  if (context.goalsData.activeGoals === 0) {
    recommendations.push({
      type: 'goals',
      priority: 'medium',
      action: 'Set a small, achievable goal for this week',
      reason: 'Goals provide direction and a sense of accomplishment'
    });
  }
  
  return recommendations;
}

function identifyUserStrengths(context) {
  const strengths = [];
  
  if (context.journalData.totalEntries > 15) {
    strengths.push('Consistent self-reflection through journaling');
  }
  if (context.goalsData.completionRate > 60) {
    strengths.push('Strong goal achievement');
  }
  if (context.activityData.consistency === 'high') {
    strengths.push('Excellent wellness routine consistency');
  }
  if (context.chatData.totalMessages > 30) {
    strengths.push('Active engagement with support resources');
  }
  
  return strengths.length > 0 ? strengths : ['Seeking help and using mental health tools'];
}

function identifyGrowthAreas(context) {
  const areas = [];
  
  if (context.moodData.volatility > 2) {
    areas.push('Mood stability - consider stress management techniques');
  }
  if (context.activityData.totalActivities < 10) {
    areas.push('Wellness activity engagement - try to incorporate more activities');
  }
  if (context.goalsData.activeGoals === 0) {
    areas.push('Goal setting - establish clear, achievable objectives');
  }
  
  return areas;
}

async function translateResponse(response, targetLanguage) {
  // In production, integrate with translation API
  // For now, return original with language marker
  return {
    ...response,
    language: targetLanguage,
    translated: true,
    note: `Translation to ${targetLanguage} would be applied here`
  };
}

export default router;
