import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'mood',
      'journal',
      'wellness',
      'goals',
      'social',
      'streak',
      'milestone',
      'special'
    ],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  xpReward: {
    type: Number,
    default: 0
  },
  requirement: {
    type: {
      type: String,
      enum: ['count', 'streak', 'milestone', 'special'],
      required: true
    },
    target: Number,
    action: String
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

badgeSchema.index({ category: 1, order: 1 });

export default mongoose.model('Badge', badgeSchema);
