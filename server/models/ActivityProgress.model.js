import mongoose from 'mongoose';

const activityProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WellnessActivity',
    required: true
  },
  completions: [{
    completedAt: {
      type: Date,
      default: Date.now
    },
    duration: Number, // actual duration completed in minutes
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    notes: String
  }],
  totalCompletions: {
    type: Number,
    default: 0
  },
  totalMinutes: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastCompletedAt: {
    type: Date,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
activityProgressSchema.index({ userId: 1, activityId: 1 }, { unique: true });
activityProgressSchema.index({ userId: 1, isFavorite: 1 });
activityProgressSchema.index({ userId: 1, lastCompletedAt: -1 });

// Method to calculate streak
activityProgressSchema.methods.calculateStreak = function() {
  if (this.completions.length === 0) {
    this.currentStreak = 0;
    return 0;
  }

  const sortedCompletions = this.completions
    .map(c => new Date(c.completedAt))
    .sort((a, b) => b - a);

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCompletion = new Date(sortedCompletions[0]);
  lastCompletion.setHours(0, 0, 0, 0);

  const daysSinceLastCompletion = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));

  if (daysSinceLastCompletion > 1) {
    this.currentStreak = 0;
    return 0;
  }

  for (let i = 1; i < sortedCompletions.length; i++) {
    const current = new Date(sortedCompletions[i - 1]);
    current.setHours(0, 0, 0, 0);
    
    const previous = new Date(sortedCompletions[i]);
    previous.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      streak++;
    } else if (dayDiff === 0) {
      continue;
    } else {
      break;
    }
  }

  this.currentStreak = streak;
  this.longestStreak = Math.max(this.longestStreak, streak);
  
  return streak;
};

const ActivityProgress = mongoose.model('ActivityProgress', activityProgressSchema);

export default ActivityProgress;
