import mongoose from 'mongoose';

const wellnessChallengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['30-day', 'group', 'weekly', 'custom'],
    required: true
  },
  category: {
    type: String,
    enum: ['mindfulness', 'exercise', 'nutrition', 'sleep', 'social', 'gratitude', 'creativity', 'learning', 'mixed'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  dailyTasks: [{
    day: Number,
    task: String,
    description: String,
    points: {
      type: Number,
      default: 10
    }
  }],
  goals: [{
    description: String,
    target: Number,
    unit: String
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  points: {
    completion: {
      type: Number,
      default: 100
    },
    daily: {
      type: Number,
      default: 10
    },
    bonus: {
      type: Number,
      default: 50
    }
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      completedDays: {
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
      totalPoints: {
        type: Number,
        default: 0
      },
      completedTasks: [{
        day: Number,
        completedAt: Date,
        points: Number
      }],
      lastCheckIn: Date
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active'
    },
    completedAt: Date,
    certificateIssued: {
      type: Boolean,
      default: false
    }
  }],
  isGroup: {
    type: Boolean,
    default: false
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x200'
  },
  badge: {
    name: String,
    icon: String,
    color: String
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'archived'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
wellnessChallengeSchema.index({ type: 1, status: 1 });
wellnessChallengeSchema.index({ category: 1 });
wellnessChallengeSchema.index({ startDate: 1, endDate: 1 });
wellnessChallengeSchema.index({ 'participants.userId': 1 });

// Method to check if user is participant
wellnessChallengeSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.userId.toString() === userId.toString());
};

// Method to get user's progress
wellnessChallengeSchema.methods.getUserProgress = function(userId) {
  return this.participants.find(p => p.userId.toString() === userId.toString());
};

// Static method to get leaderboard
wellnessChallengeSchema.statics.getLeaderboard = async function(challengeId) {
  const challenge = await this.findById(challengeId)
    .populate('participants.userId', 'profile');
  
  if (!challenge) return [];
  
  const leaderboard = challenge.participants
    .filter(p => p.status === 'active' || p.status === 'completed')
    .map(p => ({
      userId: p.userId,
      name: p.userId?.profile?.name || 'Anonymous',
      avatar: p.userId?.profile?.avatar,
      totalPoints: p.progress.totalPoints,
      completedDays: p.progress.completedDays,
      currentStreak: p.progress.currentStreak,
      status: p.status
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);
  
  return leaderboard;
};

export default mongoose.model('WellnessChallenge', wellnessChallengeSchema);
