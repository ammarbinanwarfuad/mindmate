import mongoose from 'mongoose';

const behavioralActivationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  activity: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: [
      'achievement',
      'social',
      'pleasure',
      'exercise',
      'self-care',
      'creative',
      'learning',
      'routine'
    ],
    required: true
  },
  // Planning
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: String,
  duration: Number, // in minutes
  location: String,
  withWhom: String,
  // Predictions
  predictedEnjoyment: {
    type: Number,
    min: 0,
    max: 10
  },
  predictedAccomplishment: {
    type: Number,
    min: 0,
    max: 10
  },
  predictedDifficulty: {
    type: Number,
    min: 0,
    max: 10
  },
  // Actual Experience
  completed: {
    type: Boolean,
    default: false
  },
  completedDate: Date,
  actualEnjoyment: {
    type: Number,
    min: 0,
    max: 10
  },
  actualAccomplishment: {
    type: Number,
    min: 0,
    max: 10
  },
  actualDifficulty: {
    type: Number,
    min: 0,
    max: 10
  },
  // Mood
  moodBefore: {
    type: Number,
    min: 0,
    max: 10
  },
  moodAfter: {
    type: Number,
    min: 0,
    max: 10
  },
  // Notes
  notes: String,
  barriers: [String],
  // Reminders
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

behavioralActivationSchema.index({ userId: 1, scheduledDate: 1 });
behavioralActivationSchema.index({ userId: 1, completed: 1 });

export default mongoose.model('BehavioralActivation', behavioralActivationSchema);
