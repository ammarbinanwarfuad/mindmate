import mongoose from 'mongoose';

const checkInSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  scheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'biweekly', 'monthly'],
    default: 'once'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
checkInSchema.index({ matchId: 1, scheduledFor: 1 });
checkInSchema.index({ scheduledBy: 1, completed: 1 });
checkInSchema.index({ scheduledFor: 1, completed: 1 });

const CheckIn = mongoose.model('CheckIn', checkInSchema);

export default CheckIn;
