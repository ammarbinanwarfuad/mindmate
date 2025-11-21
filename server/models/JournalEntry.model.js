import mongoose from 'mongoose';

const journalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Gratitude', 'Reflection', 'Emotional Check-in', 'Growth', 'Future Planning']
  },
  prompt: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  promptIndex: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Index for querying user's journal entries by date and category
journalEntrySchema.index({ userId: 1, createdAt: -1 });
journalEntrySchema.index({ userId: 1, category: 1, createdAt: -1 });

export default mongoose.model('JournalEntry', journalEntrySchema);
