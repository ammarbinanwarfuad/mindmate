import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'voice', 'photo', 'mixed'],
    default: 'text'
  },
  mood: {
    type: Number,
    min: 1,
    max: 10
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    enum: [
      'gratitude',
      'reflection',
      'goals',
      'dreams',
      'thoughts',
      'feelings',
      'experiences',
      'challenges',
      'achievements',
      'relationships',
      'self-care',
      'other'
    ],
    default: 'thoughts'
  },
  // Voice recording
  voiceUrl: {
    type: String
  },
  voicePublicId: {
    type: String
  },
  voiceDuration: {
    type: Number // in seconds
  },
  voiceTranscript: {
    type: String
  },
  // Photos
  photos: [{
    url: String,
    publicId: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  wordCount: {
    type: Number,
    default: 0
  },
  readingTime: {
    type: Number, // in minutes
    default: 0
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  // AI Analysis
  sentiment: {
    score: Number, // -1 to 1
    label: {
      type: String,
      enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive']
    }
  },
  themes: [{
    theme: String,
    confidence: Number
  }],
  aiInsights: {
    type: String
  },
  // Prompt used (if any)
  promptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JournalPrompt'
  },
  // Dates
  journalDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
journalSchema.index({ userId: 1, createdAt: -1 });
journalSchema.index({ userId: 1, journalDate: -1 });
journalSchema.index({ userId: 1, category: 1 });
journalSchema.index({ userId: 1, tags: 1 });
journalSchema.index({ userId: 1, isFavorite: 1 });
journalSchema.index({ userId: 1, 'sentiment.label': 1 });

// Text search index
journalSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Calculate word count and reading time before saving
journalSchema.pre('save', function(next) {
  if (this.content) {
    const words = this.content.trim().split(/\s+/).length;
    this.wordCount = words;
    this.readingTime = Math.ceil(words / 200); // Average reading speed: 200 words/min
  }
  next();
});

// Virtual for formatted date
journalSchema.virtual('formattedDate').get(function() {
  return this.journalDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Method to get excerpt
journalSchema.methods.getExcerpt = function(length = 150) {
  if (this.content.length <= length) return this.content;
  return this.content.substring(0, length) + '...';
};

export default mongoose.model('Journal', journalSchema);
