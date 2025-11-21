import mongoose from 'mongoose';

const sharedActivitySchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  activityType: {
    type: String,
    enum: ['meditation', 'wellness', 'mood_tracking', 'journaling', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  targetCount: {
    type: Number,
    default: 7
  },
  duration: {
    type: Number // in days
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    progress: {
      type: Number,
      default: 0
    },
    completedDates: [{
      type: Date
    }],
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
sharedActivitySchema.index({ matchId: 1, status: 1 });
sharedActivitySchema.index({ 'participants.userId': 1 });

const SharedActivity = mongoose.model('SharedActivity', sharedActivitySchema);

export default SharedActivity;
