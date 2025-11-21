import mongoose from 'mongoose';

const wellnessActivitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['meditation', 'breathing', 'sleep', 'yoga', 'mindfulness', 'relaxation']
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  audioUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  instructions: [{
    step: Number,
    text: String
  }],
  benefits: [String],
  tags: [String],
  category: {
    type: String,
    enum: ['stress-relief', 'sleep', 'anxiety', 'focus', 'energy', 'calm'],
    default: 'calm'
  },
  popularity: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'system'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
wellnessActivitySchema.index({ type: 1, difficulty: 1 });
wellnessActivitySchema.index({ category: 1 });
wellnessActivitySchema.index({ popularity: -1 });
wellnessActivitySchema.index({ tags: 1 });

const WellnessActivity = mongoose.model('WellnessActivity', wellnessActivitySchema);

export default WellnessActivity;
