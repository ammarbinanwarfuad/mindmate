import Journal from '../models/Journal.model.js';
import JournalPrompt, { JOURNAL_PROMPTS } from '../models/JournalPrompt.model.js';

/**
 * Seed journal prompts into the database
 */
export const seedJournalPrompts = async () => {
  try {
    const count = await JournalPrompt.countDocuments();
    if (count === 0) {
      await JournalPrompt.insertMany(JOURNAL_PROMPTS);
      console.log('✅ Journal prompts seeded successfully');
    }
  } catch (error) {
    console.error('Error seeding journal prompts:', error);
  }
};

/**
 * Analyze journal sentiment (simple keyword-based)
 */
export const analyzeSentiment = (text) => {
  const positiveWords = [
    'happy', 'joy', 'love', 'excited', 'grateful', 'amazing', 'wonderful',
    'great', 'good', 'better', 'best', 'proud', 'accomplished', 'peaceful',
    'calm', 'relaxed', 'hopeful', 'optimistic', 'blessed', 'thankful'
  ];

  const negativeWords = [
    'sad', 'angry', 'depressed', 'anxious', 'worried', 'stressed', 'upset',
    'frustrated', 'disappointed', 'hurt', 'pain', 'terrible', 'awful',
    'horrible', 'bad', 'worse', 'worst', 'lonely', 'scared', 'afraid'
  ];

  const words = text.toLowerCase().split(/\W+/);
  let positiveCount = 0;
  let negativeCount = 0;

  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });

  const total = positiveCount + negativeCount;
  if (total === 0) {
    return { score: 0, label: 'neutral' };
  }

  const score = (positiveCount - negativeCount) / total;

  let label;
  if (score >= 0.5) label = 'very_positive';
  else if (score >= 0.2) label = 'positive';
  else if (score <= -0.5) label = 'very_negative';
  else if (score <= -0.2) label = 'negative';
  else label = 'neutral';

  return { score, label };
};

/**
 * Extract themes from journal content
 */
export const extractThemes = (text) => {
  const themeKeywords = {
    relationships: ['friend', 'family', 'love', 'partner', 'relationship', 'connection', 'people'],
    work: ['work', 'job', 'career', 'project', 'meeting', 'boss', 'colleague'],
    health: ['health', 'exercise', 'sleep', 'energy', 'tired', 'sick', 'wellness'],
    emotions: ['feel', 'emotion', 'mood', 'happy', 'sad', 'angry', 'anxious'],
    growth: ['learn', 'grow', 'improve', 'change', 'develop', 'progress', 'goal'],
    challenges: ['difficult', 'hard', 'struggle', 'problem', 'challenge', 'obstacle'],
    gratitude: ['grateful', 'thankful', 'appreciate', 'blessing', 'lucky', 'fortunate'],
    creativity: ['create', 'art', 'music', 'write', 'imagine', 'idea', 'inspiration']
  };

  const words = text.toLowerCase().split(/\W+/);
  const themes = [];

  Object.keys(themeKeywords).forEach(theme => {
    const keywords = themeKeywords[theme];
    const matches = words.filter(word => keywords.some(kw => word.includes(kw))).length;
    
    if (matches > 0) {
      const confidence = Math.min(matches / words.length * 100, 100);
      themes.push({ theme, confidence: parseFloat(confidence.toFixed(2)) });
    }
  });

  // Sort by confidence and return top 3
  return themes.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
};

/**
 * Generate AI insights for a journal entry
 */
export const generateInsights = (journal) => {
  const insights = [];

  // Sentiment-based insights
  if (journal.sentiment) {
    if (journal.sentiment.label === 'very_positive') {
      insights.push("Your writing reflects a very positive mindset. Consider what contributed to these feelings.");
    } else if (journal.sentiment.label === 'very_negative') {
      insights.push("It sounds like you're going through a difficult time. Remember, it's okay to reach out for support.");
    }
  }

  // Word count insights
  if (journal.wordCount > 500) {
    insights.push("You had a lot to express today. Deep reflection can be very therapeutic.");
  } else if (journal.wordCount < 50) {
    insights.push("Sometimes brief entries capture the essence. Consider expanding on your thoughts when you're ready.");
  }

  // Theme-based insights
  if (journal.themes && journal.themes.length > 0) {
    const topTheme = journal.themes[0].theme;
    const themeInsights = {
      relationships: "Your relationships seem to be on your mind. Nurturing connections is important for well-being.",
      work: "Work appears to be a significant focus. Remember to maintain work-life balance.",
      health: "You're thinking about your health, which is a positive step toward wellness.",
      emotions: "You're in touch with your emotions. This self-awareness is valuable for growth.",
      growth: "Your focus on personal growth shows a commitment to self-improvement.",
      challenges: "Acknowledging challenges is the first step to overcoming them.",
      gratitude: "Practicing gratitude can significantly boost your mood and outlook.",
      creativity: "Engaging with creativity can be a wonderful outlet for expression."
    };
    
    if (themeInsights[topTheme]) {
      insights.push(themeInsights[topTheme]);
    }
  }

  // Category-based insights
  const categoryInsights = {
    gratitude: "Gratitude journaling has been shown to improve mental health and happiness.",
    reflection: "Regular reflection helps you learn from experiences and grow.",
    goals: "Writing about your goals makes you more likely to achieve them.",
    challenges: "Expressing difficulties through writing can help process and overcome them."
  };

  if (categoryInsights[journal.category]) {
    insights.push(categoryInsights[journal.category]);
  }

  return insights.join(' ');
};

/**
 * Search journals with filters
 */
export const searchJournals = async (userId, filters) => {
  const query = { userId };

  // Text search
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  // Category filter
  if (filters.category && filters.category !== 'all') {
    query.category = filters.category;
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    query.tags = { $in: filters.tags };
  }

  // Sentiment filter
  if (filters.sentiment) {
    query['sentiment.label'] = filters.sentiment;
  }

  // Favorites filter
  if (filters.favorites === 'true' || filters.favorites === true) {
    query.isFavorite = true;
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.journalDate = {};
    if (filters.startDate) query.journalDate.$gte = new Date(filters.startDate);
    if (filters.endDate) query.journalDate.$lte = new Date(filters.endDate);
  }

  // Type filter
  if (filters.type && filters.type !== 'all') {
    query.type = filters.type;
  }

  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 20;
  const skip = (page - 1) * limit;

  const [journals, total] = await Promise.all([
    Journal.find(query)
      .sort({ journalDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v'),
    Journal.countDocuments(query)
  ]);

  return {
    journals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get journal statistics
 */
export const getJournalStats = async (userId) => {
  const journals = await Journal.find({ userId });

  const stats = {
    totalEntries: journals.length,
    totalWords: journals.reduce((sum, j) => sum + j.wordCount, 0),
    totalReadingTime: journals.reduce((sum, j) => sum + j.readingTime, 0),
    favoriteCount: journals.filter(j => j.isFavorite).length,
    entriesByType: {
      text: journals.filter(j => j.type === 'text').length,
      voice: journals.filter(j => j.type === 'voice').length,
      photo: journals.filter(j => j.type === 'photo').length,
      mixed: journals.filter(j => j.type === 'mixed').length
    },
    entriesByCategory: {},
    sentimentDistribution: {
      very_positive: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
      very_negative: 0
    },
    currentStreak: 0,
    longestStreak: 0
  };

  // Count by category
  journals.forEach(j => {
    stats.entriesByCategory[j.category] = (stats.entriesByCategory[j.category] || 0) + 1;
    if (j.sentiment && j.sentiment.label) {
      stats.sentimentDistribution[j.sentiment.label]++;
    }
  });

  // Calculate streaks
  if (journals.length > 0) {
    const sortedJournals = journals.sort((a, b) => b.journalDate - a.journalDate);
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastEntryDate = new Date(sortedJournals[0].journalDate);
    lastEntryDate.setHours(0, 0, 0, 0);
    
    const daysSinceLastEntry = Math.floor((today - lastEntryDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceLastEntry <= 1) {
      for (let i = 1; i < sortedJournals.length; i++) {
        const currentDate = new Date(sortedJournals[i - 1].journalDate);
        currentDate.setHours(0, 0, 0, 0);
        
        const prevDate = new Date(sortedJournals[i].journalDate);
        prevDate.setHours(0, 0, 0, 0);
        
        const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentStreak++;
          tempStreak++;
        } else if (dayDiff === 0) {
          continue;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 1; i < sortedJournals.length; i++) {
      const currentDate = new Date(sortedJournals[i - 1].journalDate);
      currentDate.setHours(0, 0, 0, 0);
      
      const prevDate = new Date(sortedJournals[i].journalDate);
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

    stats.currentStreak = currentStreak;
    stats.longestStreak = Math.max(longestStreak, currentStreak);
  }

  return stats;
};

/**
 * Get journal insights and patterns
 */
export const getJournalInsights = async (userId) => {
  const journals = await Journal.find({ userId }).sort({ journalDate: -1 }).limit(100);

  if (journals.length < 5) {
    return {
      insights: [],
      message: 'Keep journaling to unlock insights! We need at least 5 entries to identify patterns.'
    };
  }

  const insights = [];

  // Most common themes
  const allThemes = {};
  journals.forEach(j => {
    if (j.themes) {
      j.themes.forEach(t => {
        allThemes[t.theme] = (allThemes[t.theme] || 0) + 1;
      });
    }
  });

  const topThemes = Object.entries(allThemes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([theme, count]) => ({ theme, count }));

  if (topThemes.length > 0) {
    insights.push({
      type: 'themes',
      title: 'Common Themes',
      description: `Your most frequent themes are: ${topThemes.map(t => t.theme).join(', ')}`,
      data: topThemes
    });
  }

  // Sentiment trends
  const recentSentiment = journals.slice(0, 10).filter(j => j.sentiment);
  if (recentSentiment.length >= 5) {
    const avgScore = recentSentiment.reduce((sum, j) => sum + j.sentiment.score, 0) / recentSentiment.length;
    const trend = avgScore > 0.2 ? 'positive' : avgScore < -0.2 ? 'negative' : 'neutral';
    
    insights.push({
      type: 'sentiment',
      title: 'Recent Mood Trend',
      description: `Your recent entries show a ${trend} emotional trend`,
      data: { averageScore: avgScore.toFixed(2), trend }
    });
  }

  // Writing patterns
  const avgWordCount = journals.reduce((sum, j) => sum + j.wordCount, 0) / journals.length;
  insights.push({
    type: 'writing',
    title: 'Writing Style',
    description: `You average ${Math.round(avgWordCount)} words per entry`,
    data: { averageWordCount: Math.round(avgWordCount) }
  });

  // Favorite category
  const categories = {};
  journals.forEach(j => {
    categories[j.category] = (categories[j.category] || 0) + 1;
  });
  const favoriteCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
  
  insights.push({
    type: 'category',
    title: 'Preferred Category',
    description: `You journal most about ${favoriteCategory[0]}`,
    data: { category: favoriteCategory[0], count: favoriteCategory[1] }
  });

  return { insights };
};
