import mongoose from 'mongoose';

const thoughtRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Situation
  situation: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Emotions
  emotions: [{
    emotion: {
      type: String,
      required: true
    },
    intensity: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    }
  }],
  // Automatic Thoughts
  automaticThoughts: [{
    thought: {
      type: String,
      required: true
    },
    belief: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    }
  }],
  // Evidence
  evidenceFor: [String],
  evidenceAgainst: [String],
  // Alternative Thoughts
  alternativeThoughts: [{
    thought: String,
    belief: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  // Outcome
  outcomeEmotions: [{
    emotion: String,
    intensity: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  // Cognitive Distortions Identified
  distortions: [{
    type: String,
    enum: [
      'all-or-nothing',
      'overgeneralization',
      'mental-filter',
      'disqualifying-positive',
      'jumping-to-conclusions',
      'magnification',
      'emotional-reasoning',
      'should-statements',
      'labeling',
      'personalization'
    ]
  }],
  // Notes
  notes: String,
  // Privacy
  isPrivate: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

thoughtRecordSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ThoughtRecord', thoughtRecordSchema);
