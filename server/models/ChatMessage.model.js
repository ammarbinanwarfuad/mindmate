import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  sentiment: {
    score: Number,
    label: String,
    confidence: Number
  },
  topic: {
    type: String
  },
  context: {
    moodAverage: Number,
    recentActivity: String,
    crisisRisk: String
  },
  language: {
    type: String,
    default: 'en'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes
chatMessageSchema.index({ userId: 1, createdAt: -1 });
chatMessageSchema.index({ topic: 1 });

export default mongoose.model('ChatMessage', chatMessageSchema);
