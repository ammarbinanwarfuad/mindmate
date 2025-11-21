import CrisisLog from '../models/CrisisLog.model.js';

/**
 * Crisis keywords and phrases categorized by severity
 */
const CRISIS_KEYWORDS = {
  critical: [
    'suicide', 'kill myself', 'end my life', 'want to die', 'better off dead',
    'no reason to live', 'can\'t go on', 'goodbye forever', 'final goodbye',
    'suicide plan', 'overdose', 'jump off', 'hang myself'
  ],
  high: [
    'self harm', 'cut myself', 'hurt myself', 'hate myself', 'worthless',
    'hopeless', 'no hope', 'give up', 'can\'t take it', 'unbearable pain',
    'nothing matters', 'everyone hates me', 'burden to everyone'
  ],
  medium: [
    'depressed', 'anxious', 'panic attack', 'can\'t breathe', 'scared',
    'alone', 'isolated', 'nobody cares', 'crying', 'breakdown',
    'can\'t cope', 'overwhelmed', 'stressed out'
  ],
  low: [
    'sad', 'down', 'tired', 'exhausted', 'worried', 'nervous',
    'upset', 'frustrated', 'angry', 'confused'
  ]
};

/**
 * Detect crisis indicators in text
 */
export const detectCrisis = async (text, userId, source = 'chat') => {
  if (!text || typeof text !== 'string') {
    return { isCrisis: false };
  }

  const lowerText = text.toLowerCase();
  const detectedKeywords = [];
  let severity = 'low';
  let isCrisis = false;

  // Check for critical keywords
  for (const keyword of CRISIS_KEYWORDS.critical) {
    if (lowerText.includes(keyword)) {
      detectedKeywords.push(keyword);
      severity = 'critical';
      isCrisis = true;
    }
  }

  // Check for high severity keywords
  if (severity !== 'critical') {
    for (const keyword of CRISIS_KEYWORDS.high) {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        severity = 'high';
        isCrisis = true;
      }
    }
  }

  // Check for medium severity keywords
  if (severity !== 'critical' && severity !== 'high') {
    for (const keyword of CRISIS_KEYWORDS.medium) {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        severity = 'medium';
        // Medium severity is borderline - only flag if multiple keywords
        if (detectedKeywords.length >= 2) {
          isCrisis = true;
        }
      }
    }
  }

  // Sentiment analysis (simple version)
  const sentimentScore = calculateSentiment(lowerText);

  // If very negative sentiment, increase severity
  if (sentimentScore < -0.7 && isCrisis) {
    if (severity === 'high') severity = 'critical';
    if (severity === 'medium') severity = 'high';
  }

  // Log crisis detection
  if (isCrisis) {
    const crisisLog = await CrisisLog.create({
      userId,
      detectionSource: source,
      severity,
      keywords: detectedKeywords,
      content: text.substring(0, 500), // Store first 500 chars
      sentimentScore,
      interventionTaken: 'modal_shown',
      followUpScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours later
    });

    return {
      isCrisis: true,
      severity,
      keywords: detectedKeywords,
      sentimentScore,
      crisisLogId: crisisLog._id,
      message: getCrisisMessage(severity)
    };
  }

  return { isCrisis: false };
};

/**
 * Simple sentiment analysis
 */
function calculateSentiment(text) {
  const positiveWords = ['happy', 'good', 'great', 'better', 'hope', 'love', 'joy', 'excited', 'grateful', 'thankful'];
  const negativeWords = ['sad', 'bad', 'worse', 'hate', 'pain', 'hurt', 'cry', 'angry', 'scared', 'afraid', 'hopeless', 'worthless'];

  let score = 0;
  const words = text.toLowerCase().split(/\s+/);

  words.forEach(word => {
    if (positiveWords.includes(word)) score += 0.1;
    if (negativeWords.includes(word)) score -= 0.1;
  });

  // Normalize to -1 to 1 range
  return Math.max(-1, Math.min(1, score));
}

/**
 * Get appropriate crisis message based on severity
 */
function getCrisisMessage(severity) {
  const messages = {
    critical: 'We detected that you may be in crisis. Your safety is our top priority. Please reach out for immediate help.',
    high: 'We\'re concerned about what you shared. You don\'t have to go through this alone. Help is available.',
    medium: 'It sounds like you\'re going through a difficult time. Would you like to access support resources?',
    low: 'We noticed you might be struggling. Remember, support is always available if you need it.'
  };

  return messages[severity] || messages.low;
}

/**
 * Check for pending follow-ups
 */
export const getPendingFollowUps = async () => {
  const now = new Date();
  const followUps = await CrisisLog.find({
    followUpScheduled: { $lte: now },
    followUpCompleted: false,
    resolved: false
  }).populate('userId', 'profile.name email');

  return followUps;
};

/**
 * Complete follow-up
 */
export const completeFollowUp = async (crisisLogId, response) => {
  const crisisLog = await CrisisLog.findById(crisisLogId);
  
  if (!crisisLog) {
    throw new Error('Crisis log not found');
  }

  crisisLog.followUpCompleted = true;
  crisisLog.followUpResponse = response;

  // If user indicates they're doing better, mark as resolved
  if (response.mood >= 6 && !response.needsHelp) {
    crisisLog.resolved = true;
    crisisLog.resolvedAt = new Date();
  } else if (response.needsHelp) {
    // Schedule another follow-up in 24 hours
    crisisLog.followUpScheduled = new Date(Date.now() + 24 * 60 * 60 * 1000);
    crisisLog.followUpCompleted = false;
  }

  await crisisLog.save();
  return crisisLog;
};

/**
 * Get user's crisis history
 */
export const getUserCrisisHistory = async (userId, limit = 10) => {
  const history = await CrisisLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return history;
};

/**
 * Get crisis statistics for user
 */
export const getCrisisStats = async (userId) => {
  const total = await CrisisLog.countDocuments({ userId });
  const resolved = await CrisisLog.countDocuments({ userId, resolved: true });
  const pending = await CrisisLog.countDocuments({ userId, resolved: false });
  
  const recentCrises = await CrisisLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(5);

  const lastCrisis = recentCrises.length > 0 ? recentCrises[0].createdAt : null;

  return {
    total,
    resolved,
    pending,
    lastCrisis,
    recentCrises
  };
};
