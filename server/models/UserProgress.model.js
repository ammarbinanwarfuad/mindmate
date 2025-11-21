import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // XP and Level
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  // Badges
  unlockedBadges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    unlockedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Challenges
  activeChallenges: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    progress: {
      type: Number,
      default: 0
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  completedChallenges: [{
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    xpEarned: Number
  }],
  // Action Counters (for badge requirements)
  actionCounts: {
    mood_log: { type: Number, default: 0 },
    positive_mood: { type: Number, default: 0 },
    mood_with_notes: { type: Number, default: 0 },
    journal_entry: { type: Number, default: 0 },
    voice_journal: { type: Number, default: 0 },
    photo_journal: { type: Number, default: 0 },
    mixed_journal: { type: Number, default: 0 },
    gratitude_journal: { type: Number, default: 0 },
    reflection_journal: { type: Number, default: 0 },
    goals_journal: { type: Number, default: 0 },
    meditation_complete: { type: Number, default: 0 },
    breathing_exercise: { type: Number, default: 0 },
    yoga_complete: { type: Number, default: 0 },
    sound_therapy: { type: Number, default: 0 },
    goal_created: { type: Number, default: 0 },
    goal_completed: { type: Number, default: 0 },
    buddy_matched: { type: Number, default: 0 },
    messages_sent: { type: Number, default: 0 },
    check_ins: { type: Number, default: 0 },
    shared_activities: { type: Number, default: 0 },
    shared_goals: { type: Number, default: 0 },
    positive_ratings: { type: Number, default: 0 },
    icebreakers_used: { type: Number, default: 0 },
    total_actions: { type: Number, default: 0 }
  },
  // Milestones
  milestones: {
    total_words: { type: Number, default: 0 },
    meditation_minutes: { type: Number, default: 0 },
    buddy_days: { type: Number, default: 0 },
    days_active: { type: Number, default: 0 }
  },
  // Streaks
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  // Stats
  totalXpEarned: {
    type: Number,
    default: 0
  },
  badgesUnlocked: {
    type: Number,
    default: 0
  },
  challengesCompleted: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate XP needed for next level
userProgressSchema.methods.calculateXpForLevel = function(level) {
  // Exponential growth: Level 1=100, 2=250, 3=500, 4=1000, etc.
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Add XP and check for level up
userProgressSchema.methods.addXp = function(amount) {
  this.xp += amount;
  this.totalXpEarned += amount;
  
  const levelUps = [];
  
  // Check for level ups
  while (this.xp >= this.xpToNextLevel) {
    this.xp -= this.xpToNextLevel;
    this.level += 1;
    this.xpToNextLevel = this.calculateXpForLevel(this.level + 1);
    levelUps.push(this.level);
  }
  
  return levelUps;
};

// Increment action counter
userProgressSchema.methods.incrementAction = function(action, amount = 1) {
  if (this.actionCounts[action] !== undefined) {
    this.actionCounts[action] += amount;
  }
  this.actionCounts.total_actions += amount;
};

// Update streak
userProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActive = new Date(this.lastActiveDate);
  lastActive.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return false;
  } else if (daysDiff === 1) {
    // Consecutive day
    this.currentStreak += 1;
    this.longestStreak = Math.max(this.longestStreak, this.currentStreak);
    this.lastActiveDate = today;
    return true;
  } else {
    // Streak broken
    this.currentStreak = 1;
    this.lastActiveDate = today;
    return true;
  }
};

export default mongoose.model('UserProgress', userProgressSchema);
