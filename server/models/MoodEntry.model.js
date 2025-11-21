import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  emoji: {
    type: String,
    required: true
  },
  journalEntry: {
    encrypted: String,
    iv: String,
    authTag: String
  },
  triggers: [String],
  activities: [String],
  sleepHours: Number,
  analyzedSentiment: {
    type: Number,
    default: 0
  },
  aiInsights: String
}, {
  timestamps: true
});

moodEntrySchema.index({ userId: 1, date: -1 });
moodEntrySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('MoodEntry', moodEntrySchema);
