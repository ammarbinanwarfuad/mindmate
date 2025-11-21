import mongoose from 'mongoose';

const habitLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  value: {
    type: Number,
    default: 1 // For counting completions
  },
  notes: {
    type: String
  },
  mood: {
    type: Number,
    min: 1,
    max: 10
  }
}, {
  timestamps: true
});

// Indexes
habitLogSchema.index({ userId: 1, goalId: 1, completedAt: -1 });
habitLogSchema.index({ completedAt: -1 });

const HabitLog = mongoose.model('HabitLog', habitLogSchema);

export default HabitLog;
