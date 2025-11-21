import Goal from '../models/Goal.model.js';
import HabitLog from '../models/HabitLog.model.js';
import Milestone, { BADGES } from '../models/Milestone.model.js';
import MoodEntry from '../models/MoodEntry.model.js';

/**
 * Get AI-powered goal suggestions based on user's activity
 */
export const getGoalSuggestions = async (userId) => {
  try {
    const suggestions = [];

    // Get user's recent mood entries
    const recentMoods = await MoodEntry.find({ userId })
      .sort({ createdAt: -1 })
      .limit(14);

    // Get existing goals
    const existingGoals = await Goal.find({ userId, status: 'active' });
    const existingTypes = existingGoals.map(g => g.type);

    // Suggest mood tracking if low mood detected
    if (recentMoods.length > 0) {
      const avgMood = recentMoods.reduce((sum, m) => sum + m.mood, 0) / recentMoods.length;
      
      if (avgMood < 6 && !existingTypes.includes('mood')) {
        suggestions.push({
          title: 'Daily Mood Check-in',
          description: 'Track your mood every day to identify patterns',
          type: 'mood',
          frequency: 'daily',
          target: 30,
          icon: '😊',
          color: '#ec4899',
          reason: 'Building awareness of your emotions can help improve your mood'
        });
      }
    }

    // Suggest meditation if not already tracking
    if (!existingTypes.includes('meditation')) {
      suggestions.push({
        title: '10 Minutes of Meditation',
        description: 'Practice daily meditation for mental clarity',
        type: 'meditation',
        frequency: 'daily',
        target: 21,
        icon: '🧘',
        color: '#8b5cf6',
        reason: 'Regular meditation reduces stress and improves focus'
      });
    }

    // Suggest wellness activities
    if (!existingTypes.includes('wellness')) {
      suggestions.push({
        title: 'Weekly Wellness Activities',
        description: 'Complete 3 wellness activities per week',
        type: 'wellness',
        frequency: 'weekly',
        target: 12,
        icon: '✨',
        color: '#10b981',
        reason: 'Consistent wellness practice builds resilience'
      });
    }

    // Suggest journaling
    if (!existingTypes.includes('journal')) {
      suggestions.push({
        title: 'Weekly Journaling',
        description: 'Write in your journal 3 times per week',
        type: 'journal',
        frequency: 'weekly',
        target: 12,
        icon: '📝',
        color: '#f59e0b',
        reason: 'Journaling helps process emotions and track growth'
      });
    }

    // Suggest social connection
    if (!existingTypes.includes('social')) {
      suggestions.push({
        title: 'Connect with Your Buddy',
        description: 'Message your peer buddy 3 times per week',
        type: 'social',
        frequency: 'weekly',
        target: 12,
        icon: '💬',
        color: '#3b82f6',
        reason: 'Social connection is vital for mental health'
      });
    }

    return suggestions.slice(0, 4); // Return top 4 suggestions

  } catch (error) {
    console.error('Error getting goal suggestions:', error);
    throw error;
  }
};

/**
 * Check and award milestones
 */
export const checkMilestones = async (userId) => {
  try {
    const newMilestones = [];

    // Get user's completed goals
    const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });
    
    // Get total habit logs
    const totalLogs = await HabitLog.countDocuments({ userId });
    
    // Get user's existing milestones
    const existingMilestones = await Milestone.find({ userId });
    const existingBadgeIds = existingMilestones.map(m => m.badgeId);

    // Check goal completion badges
    if (completedGoals >= 1 && !existingBadgeIds.includes(BADGES.FIRST_GOAL.id)) {
      const milestone = await Milestone.create({
        userId,
        type: BADGES.FIRST_GOAL.type,
        badgeId: BADGES.FIRST_GOAL.id,
        title: BADGES.FIRST_GOAL.title,
        description: BADGES.FIRST_GOAL.description,
        icon: BADGES.FIRST_GOAL.icon
      });
      newMilestones.push(milestone);
    }

    if (completedGoals >= 5 && !existingBadgeIds.includes(BADGES.FIVE_GOALS.id)) {
      const milestone = await Milestone.create({
        userId,
        type: BADGES.FIVE_GOALS.type,
        badgeId: BADGES.FIVE_GOALS.id,
        title: BADGES.FIVE_GOALS.title,
        description: BADGES.FIVE_GOALS.description,
        icon: BADGES.FIVE_GOALS.icon
      });
      newMilestones.push(milestone);
    }

    if (completedGoals >= 10 && !existingBadgeIds.includes(BADGES.TEN_GOALS.id)) {
      const milestone = await Milestone.create({
        userId,
        type: BADGES.TEN_GOALS.type,
        badgeId: BADGES.TEN_GOALS.id,
        title: BADGES.TEN_GOALS.title,
        description: BADGES.TEN_GOALS.description,
        icon: BADGES.TEN_GOALS.icon
      });
      newMilestones.push(milestone);
    }

    // Check total completions badges
    if (totalLogs >= 50 && !existingBadgeIds.includes(BADGES.FIFTY_COMPLETIONS.id)) {
      const milestone = await Milestone.create({
        userId,
        type: BADGES.FIFTY_COMPLETIONS.type,
        badgeId: BADGES.FIFTY_COMPLETIONS.id,
        title: BADGES.FIFTY_COMPLETIONS.title,
        description: BADGES.FIFTY_COMPLETIONS.description,
        icon: BADGES.FIFTY_COMPLETIONS.icon
      });
      newMilestones.push(milestone);
    }

    if (totalLogs >= 100 && !existingBadgeIds.includes(BADGES.HUNDRED_COMPLETIONS.id)) {
      const milestone = await Milestone.create({
        userId,
        type: BADGES.HUNDRED_COMPLETIONS.type,
        badgeId: BADGES.HUNDRED_COMPLETIONS.id,
        title: BADGES.HUNDRED_COMPLETIONS.title,
        description: BADGES.HUNDRED_COMPLETIONS.description,
        icon: BADGES.HUNDRED_COMPLETIONS.icon
      });
      newMilestones.push(milestone);
    }

    if (totalLogs >= 500 && !existingBadgeIds.includes(BADGES.FIVE_HUNDRED_COMPLETIONS.id)) {
      const milestone = await Milestone.create({
        userId,
        type: BADGES.FIVE_HUNDRED_COMPLETIONS.type,
        badgeId: BADGES.FIVE_HUNDRED_COMPLETIONS.id,
        title: BADGES.FIVE_HUNDRED_COMPLETIONS.title,
        description: BADGES.FIVE_HUNDRED_COMPLETIONS.description,
        icon: BADGES.FIVE_HUNDRED_COMPLETIONS.icon
      });
      newMilestones.push(milestone);
    }

    // Check streak badges for active goals
    const activeGoals = await Goal.find({ userId, status: 'active' });
    for (const goal of activeGoals) {
      const streak = goal.calculateStreak();
      
      if (streak >= 7 && !existingBadgeIds.includes(BADGES.WEEK_STREAK.id)) {
        const milestone = await Milestone.create({
          userId,
          type: BADGES.WEEK_STREAK.type,
          badgeId: BADGES.WEEK_STREAK.id,
          title: BADGES.WEEK_STREAK.title,
          description: BADGES.WEEK_STREAK.description,
          icon: BADGES.WEEK_STREAK.icon,
          relatedGoalId: goal._id
        });
        newMilestones.push(milestone);
      }

      if (streak >= 30 && !existingBadgeIds.includes(BADGES.MONTH_STREAK.id)) {
        const milestone = await Milestone.create({
          userId,
          type: BADGES.MONTH_STREAK.type,
          badgeId: BADGES.MONTH_STREAK.id,
          title: BADGES.MONTH_STREAK.title,
          description: BADGES.MONTH_STREAK.description,
          icon: BADGES.MONTH_STREAK.icon,
          relatedGoalId: goal._id
        });
        newMilestones.push(milestone);
      }

      if (streak >= 100 && !existingBadgeIds.includes(BADGES.HUNDRED_STREAK.id)) {
        const milestone = await Milestone.create({
          userId,
          type: BADGES.HUNDRED_STREAK.type,
          badgeId: BADGES.HUNDRED_STREAK.id,
          title: BADGES.HUNDRED_STREAK.title,
          description: BADGES.HUNDRED_STREAK.description,
          icon: BADGES.HUNDRED_STREAK.icon,
          relatedGoalId: goal._id
        });
        newMilestones.push(milestone);
      }
    }

    return newMilestones;

  } catch (error) {
    console.error('Error checking milestones:', error);
    throw error;
  }
};

/**
 * Get user's goal statistics
 */
export const getGoalStats = async (userId) => {
  try {
    const activeGoals = await Goal.countDocuments({ userId, status: 'active' });
    const completedGoals = await Goal.countDocuments({ userId, status: 'completed' });
    const totalLogs = await HabitLog.countDocuments({ userId });
    
    // Get goals with highest streaks
    const goals = await Goal.find({ userId, status: 'active' });
    let longestStreak = 0;
    let currentStreak = 0;
    
    goals.forEach(goal => {
      const streak = goal.calculateStreak();
      longestStreak = Math.max(longestStreak, streak);
      currentStreak = Math.max(currentStreak, streak);
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentLogs = await HabitLog.countDocuments({
      userId,
      completedAt: { $gte: sevenDaysAgo }
    });

    // Get milestones
    const totalMilestones = await Milestone.countDocuments({ userId });

    return {
      activeGoals,
      completedGoals,
      totalLogs,
      longestStreak,
      currentStreak,
      recentActivity: recentLogs,
      totalMilestones
    };

  } catch (error) {
    console.error('Error getting goal stats:', error);
    throw error;
  }
};
