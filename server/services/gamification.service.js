import UserProgress from '../models/UserProgress.model.js';
import Badge from '../models/Badge.model.js';
import Challenge from '../models/Challenge.model.js';
import { BADGES } from '../config/badges.js';

// XP Values for different actions
export const XP_VALUES = {
  mood_log: 10,
  journal_entry: 15,
  meditation_complete: 25,
  breathing_exercise: 15,
  yoga_complete: 20,
  sound_therapy: 15,
  goal_created: 10,
  goal_completed: 30,
  goal_progress: 5,
  buddy_matched: 15,
  message_sent: 2,
  check_in: 20,
  shared_activity: 15,
  shared_goal: 15,
  safety_plan_created: 50,
  resource_shared: 10
};

/**
 * Seed badges into database
 */
export const seedBadges = async () => {
  try {
    const count = await Badge.countDocuments();
    if (count === 0) {
      await Badge.insertMany(BADGES);
      console.log('✅ Badges seeded successfully (102 badges)');
    }
  } catch (error) {
    console.error('Error seeding badges:', error);
  }
};

/**
 * Get or create user progress
 */
export const getUserProgress = async (userId) => {
  let progress = await UserProgress.findOne({ userId });
  
  if (!progress) {
    progress = await UserProgress.create({ userId });
  }
  
  return progress;
};

/**
 * Award XP to user and check for level ups and badge unlocks
 */
export const awardXP = async (userId, action, amount = null) => {
  const xpAmount = amount || XP_VALUES[action] || 0;
  
  if (xpAmount === 0) return null;
  
  const progress = await getUserProgress(userId);
  
  // Update streak
  progress.updateStreak();
  
  // Increment action counter
  progress.incrementAction(action);
  
  // Add XP and check for level ups
  const levelUps = progress.addXp(xpAmount);
  
  // Check for badge unlocks
  const newBadges = await checkBadgeUnlocks(userId, progress);
  
  await progress.save();
  
  return {
    xpEarned: xpAmount,
    newLevel: levelUps.length > 0 ? progress.level : null,
    levelUps,
    newBadges,
    progress: {
      xp: progress.xp,
      level: progress.level,
      xpToNextLevel: progress.xpToNextLevel,
      currentStreak: progress.currentStreak
    }
  };
};

/**
 * Check if user has unlocked any new badges
 */
export const checkBadgeUnlocks = async (userId, progress) => {
  const allBadges = await Badge.find();
  const unlockedBadgeIds = progress.unlockedBadges.map(b => b.badgeId.toString());
  const newBadges = [];
  
  for (const badge of allBadges) {
    // Skip if already unlocked
    if (unlockedBadgeIds.includes(badge._id.toString())) continue;
    
    // Check if requirement is met
    const unlocked = checkBadgeRequirement(badge, progress);
    
    if (unlocked) {
      progress.unlockedBadges.push({
        badgeId: badge._id,
        unlockedAt: new Date()
      });
      progress.badgesUnlocked += 1;
      
      // Award badge XP
      if (badge.xpReward > 0) {
        progress.addXp(badge.xpReward);
      }
      
      newBadges.push(badge);
    }
  }
  
  return newBadges;
};

/**
 * Check if badge requirement is met
 */
const checkBadgeRequirement = (badge, progress) => {
  const { type, target, action } = badge.requirement;
  
  switch (type) {
    case 'count':
      return progress.actionCounts[action] >= target;
      
    case 'streak':
      if (action === 'app_usage') {
        return progress.currentStreak >= target;
      }
      // For other streak types, would need specific tracking
      return false;
      
    case 'milestone':
      return progress.milestones[action] >= target;
      
    case 'special':
      // Special badges require custom logic
      return checkSpecialBadge(action, progress);
      
    default:
      return false;
  }
};

/**
 * Check special badge requirements
 */
const checkSpecialBadge = (action, progress) => {
  switch (action) {
    case 'profile_complete':
      // Would check if user profile is complete
      return false;
      
    case 'improving_trend':
      // Would check mood trend
      return false;
      
    case 'all_wellness_types':
      // Would check if user tried all wellness types
      return false;
      
    case 'all_features':
      // Would check if user tried all main features
      return false;
      
    case 'perfect_day':
      // Would check if all daily tasks completed
      return false;
      
    default:
      return false;
  }
};

/**
 * Get user's gamification stats
 */
export const getGamificationStats = async (userId) => {
  const progress = await getUserProgress(userId);
  
  const allBadges = await Badge.find().sort({ category: 1, order: 1 });
  const unlockedBadgeIds = progress.unlockedBadges.map(b => b.badgeId.toString());
  
  const badgesByCategory = {};
  const rarityCount = { common: 0, rare: 0, epic: 0, legendary: 0 };
  
  allBadges.forEach(badge => {
    if (!badgesByCategory[badge.category]) {
      badgesByCategory[badge.category] = {
        total: 0,
        unlocked: 0,
        badges: []
      };
    }
    
    const isUnlocked = unlockedBadgeIds.includes(badge._id.toString());
    
    badgesByCategory[badge.category].total += 1;
    if (isUnlocked) {
      badgesByCategory[badge.category].unlocked += 1;
      rarityCount[badge.rarity] += 1;
    }
    
    badgesByCategory[badge.category].badges.push({
      ...badge.toObject(),
      unlocked: isUnlocked,
      unlockedAt: isUnlocked 
        ? progress.unlockedBadges.find(b => b.badgeId.toString() === badge._id.toString())?.unlockedAt 
        : null
    });
  });
  
  return {
    level: progress.level,
    xp: progress.xp,
    xpToNextLevel: progress.xpToNextLevel,
    totalXpEarned: progress.totalXpEarned,
    currentStreak: progress.currentStreak,
    longestStreak: progress.longestStreak,
    badgesUnlocked: progress.badgesUnlocked,
    totalBadges: allBadges.length,
    badgesByCategory,
    rarityCount,
    challengesCompleted: progress.challengesCompleted,
    recentBadges: progress.unlockedBadges
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, 5)
  };
};

/**
 * Get active challenges for user
 */
export const getActiveChallenges = async (userId) => {
  const now = new Date();
  
  const challenges = await Challenge.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).sort({ endDate: 1 });
  
  const progress = await getUserProgress(userId);
  
  return challenges.map(challenge => {
    const userChallenge = progress.activeChallenges.find(
      c => c.challengeId.toString() === challenge._id.toString()
    );
    
    return {
      ...challenge.toObject(),
      progress: userChallenge?.progress || 0,
      isCompleted: progress.completedChallenges.some(
        c => c.challengeId.toString() === challenge._id.toString()
      )
    };
  });
};

/**
 * Update challenge progress
 */
export const updateChallengeProgress = async (userId, action, amount = 1) => {
  const progress = await getUserProgress(userId);
  const now = new Date();
  
  const activeChallenges = await Challenge.find({
    isActive: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
    'requirement.action': action
  });
  
  const completedChallenges = [];
  
  for (const challenge of activeChallenges) {
    let userChallenge = progress.activeChallenges.find(
      c => c.challengeId.toString() === challenge._id.toString()
    );
    
    if (!userChallenge) {
      userChallenge = {
        challengeId: challenge._id,
        progress: 0,
        startedAt: new Date()
      };
      progress.activeChallenges.push(userChallenge);
    }
    
    userChallenge.progress += amount;
    
    // Check if challenge is completed
    if (userChallenge.progress >= challenge.requirement.target) {
      const alreadyCompleted = progress.completedChallenges.some(
        c => c.challengeId.toString() === challenge._id.toString()
      );
      
      if (!alreadyCompleted) {
        progress.completedChallenges.push({
          challengeId: challenge._id,
          completedAt: new Date(),
          xpEarned: challenge.xpReward
        });
        
        progress.challengesCompleted += 1;
        progress.addXp(challenge.xpReward);
        
        completedChallenges.push(challenge);
        
        // Remove from active
        progress.activeChallenges = progress.activeChallenges.filter(
          c => c.challengeId.toString() !== challenge._id.toString()
        );
      }
    }
  }
  
  await progress.save();
  
  return completedChallenges;
};

/**
 * Create daily/weekly challenges
 */
export const generateChallenges = async () => {
  const now = new Date();
  
  // Daily challenges
  const dailyStart = new Date(now);
  dailyStart.setHours(0, 0, 0, 0);
  const dailyEnd = new Date(dailyStart);
  dailyEnd.setDate(dailyEnd.getDate() + 1);
  
  const dailyChallenges = [
    {
      title: 'Mood Check-In',
      description: 'Log your mood 3 times today',
      icon: '📊',
      type: 'daily',
      category: 'mood',
      requirement: { action: 'mood_log', target: 3 },
      xpReward: 50,
      startDate: dailyStart,
      endDate: dailyEnd
    },
    {
      title: 'Mindful Moments',
      description: 'Complete 2 wellness activities',
      icon: '🧘',
      type: 'daily',
      category: 'wellness',
      requirement: { action: 'meditation_complete', target: 2 },
      xpReward: 75,
      startDate: dailyStart,
      endDate: dailyEnd
    },
    {
      title: 'Express Yourself',
      description: 'Write 1 journal entry',
      icon: '✍️',
      type: 'daily',
      category: 'journal',
      requirement: { action: 'journal_entry', target: 1 },
      xpReward: 40,
      startDate: dailyStart,
      endDate: dailyEnd
    }
  ];
  
  // Weekly challenges
  const weeklyStart = new Date(now);
  weeklyStart.setDate(weeklyStart.getDate() - weeklyStart.getDay()); // Start of week
  weeklyStart.setHours(0, 0, 0, 0);
  const weeklyEnd = new Date(weeklyStart);
  weeklyEnd.setDate(weeklyEnd.getDate() + 7);
  
  const weeklyChallenges = [
    {
      title: 'Weekly Warrior',
      description: 'Log mood every day this week',
      icon: '🔥',
      type: 'weekly',
      category: 'mood',
      requirement: { action: 'mood_log', target: 7 },
      xpReward: 150,
      startDate: weeklyStart,
      endDate: weeklyEnd
    },
    {
      title: 'Wellness Week',
      description: 'Complete 10 wellness activities',
      icon: '🌟',
      type: 'weekly',
      category: 'wellness',
      requirement: { action: 'meditation_complete', target: 10 },
      xpReward: 200,
      startDate: weeklyStart,
      endDate: weeklyEnd
    },
    {
      title: 'Goal Getter',
      description: 'Complete 5 goals this week',
      icon: '🎯',
      type: 'weekly',
      category: 'goals',
      requirement: { action: 'goal_completed', target: 5 },
      xpReward: 250,
      startDate: weeklyStart,
      endDate: weeklyEnd
    }
  ];
  
  // Check if challenges already exist for these periods
  const existingDaily = await Challenge.findOne({
    type: 'daily',
    startDate: dailyStart
  });
  
  const existingWeekly = await Challenge.findOne({
    type: 'weekly',
    startDate: weeklyStart
  });
  
  if (!existingDaily) {
    await Challenge.insertMany(dailyChallenges);
    console.log('✅ Daily challenges created');
  }
  
  if (!existingWeekly) {
    await Challenge.insertMany(weeklyChallenges);
    console.log('✅ Weekly challenges created');
  }
};

/**
 * Clean up expired challenges
 */
export const cleanupExpiredChallenges = async () => {
  const now = new Date();
  
  await Challenge.updateMany(
    { endDate: { $lt: now }, isActive: true },
    { isActive: false }
  );
};
