import MoodEntry from '../models/MoodEntry.model.js';

/**
 * Mood Analytics Service
 * Provides comprehensive mood analysis, insights, and predictions
 */

/**
 * Get comprehensive mood analytics for a user
 */
export const getMoodAnalytics = async (userId, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await MoodEntry.find({
    userId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  if (entries.length === 0) {
    return {
      totalEntries: 0,
      averageMood: 0,
      moodTrend: 'neutral',
      entries: []
    };
  }

  // Calculate average mood
  const totalMood = entries.reduce((sum, entry) => sum + entry.moodScore, 0);
  const averageMood = (totalMood / entries.length).toFixed(2);

  // Calculate mood trend (comparing first half vs second half)
  const midPoint = Math.floor(entries.length / 2);
  const firstHalfAvg = entries.slice(0, midPoint).reduce((sum, e) => sum + e.moodScore, 0) / midPoint;
  const secondHalfAvg = entries.slice(midPoint).reduce((sum, e) => sum + e.moodScore, 0) / (entries.length - midPoint);
  
  let moodTrend = 'stable';
  if (secondHalfAvg > firstHalfAvg + 0.5) moodTrend = 'improving';
  if (secondHalfAvg < firstHalfAvg - 0.5) moodTrend = 'declining';

  // Mood distribution
  const moodDistribution = {
    veryLow: entries.filter(e => e.moodScore <= 2).length,
    low: entries.filter(e => e.moodScore > 2 && e.moodScore <= 4).length,
    medium: entries.filter(e => e.moodScore > 4 && e.moodScore <= 6).length,
    high: entries.filter(e => e.moodScore > 6 && e.moodScore <= 8).length,
    veryHigh: entries.filter(e => e.moodScore > 8).length
  };

  // Best and worst days
  const sortedByMood = [...entries].sort((a, b) => b.moodScore - a.moodScore);
  const bestDays = sortedByMood.slice(0, 3);
  const worstDays = sortedByMood.slice(-3).reverse();

  return {
    totalEntries: entries.length,
    averageMood: parseFloat(averageMood),
    moodTrend,
    moodDistribution,
    bestDays,
    worstDays,
    entries
  };
};

/**
 * Get mood calendar data for heatmap
 */
export const getMoodCalendar = async (userId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const entries = await MoodEntry.find({
    userId,
    createdAt: { $gte: startDate }
  }).sort({ createdAt: 1 });

  // Format for calendar heatmap
  const calendarData = entries.map(entry => ({
    date: entry.createdAt.toISOString().split('T')[0],
    count: entry.moodScore,
    mood: entry.moodScore,
    emoji: entry.emoji
  }));

  return calendarData;
};

/**
 * Identify mood triggers and patterns
 */
export const identifyTriggers = async (userId) => {
  const entries = await MoodEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(100);

  if (entries.length < 10) {
    return {
      triggers: [],
      message: 'Not enough data to identify patterns. Keep logging your mood!'
    };
  }

  const triggers = [];

  // Analyze sleep patterns
  const sleepData = entries.filter(e => e.sleepHours);
  if (sleepData.length > 5) {
    const lowSleepMood = sleepData.filter(e => e.sleepHours < 6).reduce((sum, e) => sum + e.moodScore, 0) / sleepData.filter(e => e.sleepHours < 6).length || 0;
    const goodSleepMood = sleepData.filter(e => e.sleepHours >= 7).reduce((sum, e) => sum + e.moodScore, 0) / sleepData.filter(e => e.sleepHours >= 7).length || 0;
    
    if (goodSleepMood - lowSleepMood > 1) {
      triggers.push({
        type: 'sleep',
        factor: 'Sleep Quality',
        insight: `You feel ${(goodSleepMood - lowSleepMood).toFixed(1)} points better with 7+ hours of sleep`,
        recommendation: 'Try to maintain a consistent sleep schedule of 7-8 hours',
        impact: 'high'
      });
    }
  }

  // Analyze day of week patterns
  const dayMoods = {};
  entries.forEach(entry => {
    const day = new Date(entry.createdAt).getDay();
    if (!dayMoods[day]) dayMoods[day] = [];
    dayMoods[day].push(entry.moodScore);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAverages = Object.keys(dayMoods).map(day => ({
    day: parseInt(day),
    name: dayNames[day],
    average: dayMoods[day].reduce((a, b) => a + b, 0) / dayMoods[day].length
  }));

  const bestDay = dayAverages.reduce((max, day) => day.average > max.average ? day : max);
  const worstDay = dayAverages.reduce((min, day) => day.average < min.average ? day : min);

  if (bestDay.average - worstDay.average > 1.5) {
    triggers.push({
      type: 'day_of_week',
      factor: 'Day of Week',
      insight: `Your mood is typically ${(bestDay.average - worstDay.average).toFixed(1)} points higher on ${bestDay.name} than ${worstDay.name}`,
      recommendation: `Plan self-care activities for ${worstDay.name}s`,
      impact: 'medium'
    });
  }

  // Analyze activity patterns
  const activityData = entries.filter(e => e.activities && e.activities.length > 0);
  if (activityData.length > 10) {
    const activityMoods = {};
    activityData.forEach(entry => {
      entry.activities.forEach(activity => {
        if (!activityMoods[activity]) activityMoods[activity] = [];
        activityMoods[activity].push(entry.moodScore);
      });
    });

    const activityAverages = Object.keys(activityMoods).map(activity => ({
      activity,
      average: activityMoods[activity].reduce((a, b) => a + b, 0) / activityMoods[activity].length,
      count: activityMoods[activity].length
    })).filter(a => a.count >= 3);

    const bestActivity = activityAverages.reduce((max, act) => act.average > max.average ? act : max, { average: 0 });
    
    if (bestActivity.average > 0) {
      triggers.push({
        type: 'activity',
        factor: 'Activities',
        insight: `You feel best when doing: ${bestActivity.activity}`,
        recommendation: `Try to incorporate ${bestActivity.activity} more often`,
        impact: 'high'
      });
    }
  }

  return { triggers };
};

/**
 * Analyze correlations between mood and various factors
 */
export const analyzeCorrelations = async (userId) => {
  const entries = await MoodEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(60);

  if (entries.length < 10) {
    return {
      correlations: [],
      message: 'Not enough data for correlation analysis'
    };
  }

  const correlations = [];

  // Sleep correlation
  const sleepEntries = entries.filter(e => e.sleepHours);
  if (sleepEntries.length >= 10) {
    const correlation = calculateCorrelation(
      sleepEntries.map(e => e.sleepHours),
      sleepEntries.map(e => e.moodScore)
    );
    
    correlations.push({
      factor: 'Sleep Hours',
      correlation: correlation.toFixed(2),
      strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
      insight: correlation > 0.4 ? 'More sleep tends to improve your mood' : 'Sleep doesn\'t show strong correlation with mood'
    });
  }

  // Activity count correlation
  const activityEntries = entries.filter(e => e.activities && e.activities.length > 0);
  if (activityEntries.length >= 10) {
    const correlation = calculateCorrelation(
      activityEntries.map(e => e.activities.length),
      activityEntries.map(e => e.moodScore)
    );
    
    correlations.push({
      factor: 'Activity Level',
      correlation: correlation.toFixed(2),
      strength: Math.abs(correlation) > 0.7 ? 'strong' : Math.abs(correlation) > 0.4 ? 'moderate' : 'weak',
      insight: correlation > 0.4 ? 'Being more active is linked to better mood' : 'Activity level shows weak correlation with mood'
    });
  }

  return { correlations };
};

/**
 * Generate weekly mood report
 */
export const getWeeklyReport = async (userId, weekOffset = 0) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - (weekOffset * 7));
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const currentWeekEntries = await MoodEntry.find({
    userId,
    createdAt: { $gte: startDate, $lte: endDate }
  });

  const previousWeekStart = new Date(startDate);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  
  const previousWeekEntries = await MoodEntry.find({
    userId,
    createdAt: { $gte: previousWeekStart, $lt: startDate }
  });

  const currentAvg = currentWeekEntries.length > 0
    ? currentWeekEntries.reduce((sum, e) => sum + e.moodScore, 0) / currentWeekEntries.length
    : 0;

  const previousAvg = previousWeekEntries.length > 0
    ? previousWeekEntries.reduce((sum, e) => sum + e.moodScore, 0) / previousWeekEntries.length
    : 0;

  const change = currentAvg - previousAvg;
  const changePercent = previousAvg > 0 ? ((change / previousAvg) * 100).toFixed(1) : 0;

  return {
    weekStart: startDate.toISOString().split('T')[0],
    weekEnd: endDate.toISOString().split('T')[0],
    entriesLogged: currentWeekEntries.length,
    averageMood: currentAvg.toFixed(2),
    previousWeekAverage: previousAvg.toFixed(2),
    change: change.toFixed(2),
    changePercent,
    trend: change > 0.5 ? 'improving' : change < -0.5 ? 'declining' : 'stable',
    entries: currentWeekEntries
  };
};

/**
 * Predict mood based on patterns
 */
export const predictMood = async (userId) => {
  const entries = await MoodEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(30);

  if (entries.length < 14) {
    return {
      prediction: null,
      message: 'Not enough data for predictions. Keep logging!'
    };
  }

  // Simple prediction based on day of week patterns
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDay = tomorrow.getDay();

  const dayMoods = entries.filter(e => new Date(e.createdAt).getDay() === tomorrowDay);
  
  if (dayMoods.length >= 3) {
    const avgMood = dayMoods.reduce((sum, e) => sum + e.moodScore, 0) / dayMoods.length;
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      prediction: {
        day: dayNames[tomorrowDay],
        expectedMood: avgMood.toFixed(1),
        confidence: dayMoods.length >= 5 ? 'high' : 'medium',
        insight: avgMood < 5 
          ? `Based on patterns, ${dayNames[tomorrowDay]}s tend to be challenging. Plan some self-care!`
          : `${dayNames[tomorrowDay]}s are usually good for you. Keep up the positive momentum!`
      }
    };
  }

  return {
    prediction: null,
    message: 'Not enough data for this day of week'
  };
};

/**
 * Calculate mood logging streak
 */
export const getMoodStreak = async (userId) => {
  const entries = await MoodEntry.find({ userId })
    .sort({ createdAt: -1 })
    .limit(365);

  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastEntryDate = new Date(entries[0].createdAt);
  lastEntryDate.setHours(0, 0, 0, 0);
  
  // Check if logged today or yesterday
  const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastEntry <= 1) {
    currentStreak = 1;
    
    // Count consecutive days
    for (let i = 1; i < entries.length; i++) {
      const currentDate = new Date(entries[i - 1].createdAt);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(entries[i].createdAt);
      prevDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        currentStreak++;
        tempStreak++;
      } else if (dayDiff === 0) {
        // Same day, continue
        continue;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  tempStreak = 1;
  for (let i = 1; i < entries.length; i++) {
    const currentDate = new Date(entries[i - 1].createdAt);
    currentDate.setHours(0, 0, 0, 0);
    
    const prevDate = new Date(entries[i].createdAt);
    prevDate.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (dayDiff === 0) {
      continue;
    } else {
      tempStreak = 1;
    }
  }
  
  longestStreak = Math.max(longestStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    message: currentStreak > 0 
      ? `${currentStreak} day${currentStreak > 1 ? 's' : ''} streak! 🔥` 
      : 'Start a new streak today!'
  };
};

/**
 * Helper: Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x, y) {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Helper: Get correlation strength label
 */
function getCorrelationStrength(correlation) {
  const abs = Math.abs(correlation);
  if (abs >= 0.7) return 'strong';
  if (abs >= 0.4) return 'moderate';
  if (abs >= 0.2) return 'weak';
  return 'very weak';
}
