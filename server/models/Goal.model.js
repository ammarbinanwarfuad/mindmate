import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['meditation', 'mood', 'social', 'wellness', 'journal', 'custom']
  },
  frequency: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom']
  },
  target: {
    type: Number,
    required: true,
    min: 1
  },
  currentProgress: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'paused'],
    default: 'active'
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderTime: {
    type: String // Format: "HH:MM"
  },
  reminderDays: [{
    type: Number, // 0-6 (Sunday-Saturday)
    min: 0,
    max: 6
  }],
  completedDates: [{
    type: Date
  }],
  notes: {
    type: String
  },
  icon: {
    type: String,
    default: '🎯'
  },
  color: {
    type: String,
    default: '#8b5cf6'
  }
}, {
  timestamps: true
});

// Indexes
goalSchema.index({ userId: 1, status: 1 });
goalSchema.index({ userId: 1, type: 1 });
goalSchema.index({ endDate: 1 });

// Virtual for progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  return Math.min(Math.round((this.currentProgress / this.target) * 100), 100);
});

// Method to check if goal is completed
goalSchema.methods.checkCompletion = function() {
  if (this.currentProgress >= this.target && this.status === 'active') {
    this.status = 'completed';
    return true;
  }
  return false;
};

// Method to calculate streak
goalSchema.methods.calculateStreak = function() {
  if (this.completedDates.length === 0) return 0;

  const sortedDates = this.completedDates
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  let streak = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastCompletion = new Date(sortedDates[0]);
  lastCompletion.setHours(0, 0, 0, 0);

  const daysSinceLastCompletion = Math.floor((today - lastCompletion) / (1000 * 60 * 60 * 24));

  // Check if streak is broken
  if (this.frequency === 'daily' && daysSinceLastCompletion > 1) {
    return 0;
  }

  // Count consecutive days
  for (let i = 1; i < sortedDates.length; i++) {
    const current = new Date(sortedDates[i - 1]);
    current.setHours(0, 0, 0, 0);
    
    const previous = new Date(sortedDates[i]);
    previous.setHours(0, 0, 0, 0);
    
    const dayDiff = Math.floor((current - previous) / (1000 * 60 * 60 * 24));
    
    if (dayDiff === 1) {
      streak++;
    } else if (dayDiff === 0) {
      continue; // Same day, skip
    } else {
      break; // Streak broken
    }
  }

  return streak;
};

const Goal = mongoose.model('Goal', goalSchema);

export default Goal;
