import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['goal', 'streak', 'total', 'special']
  },
  badgeId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  },
  relatedGoalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }
}, {
  timestamps: true
});

// Indexes
milestoneSchema.index({ userId: 1, badgeId: 1 }, { unique: true });
milestoneSchema.index({ userId: 1, unlockedAt: -1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);

export default Milestone;

// Predefined badges
export const BADGES = {
  // Goal completion badges
  FIRST_GOAL: {
    id: 'first_goal',
    title: 'Goal Getter',
    description: 'Complete your first goal',
    icon: '🎯',
    type: 'goal',
    requirement: 1
  },
  FIVE_GOALS: {
    id: 'five_goals',
    title: 'Achiever',
    description: 'Complete 5 goals',
    icon: '⭐',
    type: 'goal',
    requirement: 5
  },
  TEN_GOALS: {
    id: 'ten_goals',
    title: 'Goal Master',
    description: 'Complete 10 goals',
    icon: '🏆',
    type: 'goal',
    requirement: 10
  },
  
  // Streak badges
  WEEK_STREAK: {
    id: 'week_streak',
    title: 'Week Warrior',
    description: '7-day streak',
    icon: '🔥',
    type: 'streak',
    requirement: 7
  },
  MONTH_STREAK: {
    id: 'month_streak',
    title: 'Consistency King',
    description: '30-day streak',
    icon: '👑',
    type: 'streak',
    requirement: 30
  },
  HUNDRED_STREAK: {
    id: 'hundred_streak',
    title: 'Century Club',
    description: '100-day streak',
    icon: '💯',
    type: 'streak',
    requirement: 100
  },
  
  // Total completions
  FIFTY_COMPLETIONS: {
    id: 'fifty_completions',
    title: 'Dedicated',
    description: '50 total habit completions',
    icon: '💪',
    type: 'total',
    requirement: 50
  },
  HUNDRED_COMPLETIONS: {
    id: 'hundred_completions',
    title: 'Committed',
    description: '100 total habit completions',
    icon: '🌟',
    type: 'total',
    requirement: 100
  },
  FIVE_HUNDRED_COMPLETIONS: {
    id: 'five_hundred_completions',
    title: 'Unstoppable',
    description: '500 total habit completions',
    icon: '🚀',
    type: 'total',
    requirement: 500
  },
  
  // Special badges
  PERFECT_WEEK: {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Complete all daily goals for a week',
    icon: '✨',
    type: 'special',
    requirement: 1
  },
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird',
    description: 'Complete a goal before 8 AM',
    icon: '🌅',
    type: 'special',
    requirement: 1
  },
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Complete a goal after 10 PM',
    icon: '🦉',
    type: 'special',
    requirement: 1
  }
};
