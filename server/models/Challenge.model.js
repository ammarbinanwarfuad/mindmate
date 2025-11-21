import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
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
    default: '🎯'
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'special'],
    required: true
  },
  category: {
    type: String,
    enum: ['mood', 'journal', 'wellness', 'goals', 'social', 'all'],
    default: 'all'
  },
  requirement: {
    action: {
      type: String,
      required: true
    },
    target: {
      type: Number,
      required: true
    }
  },
  xpReward: {
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
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

challengeSchema.index({ type: 1, isActive: 1, startDate: 1 });
challengeSchema.index({ endDate: 1 });

export default mongoose.model('Challenge', challengeSchema);
