import mongoose from 'mongoose';

const crisisLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  detectionSource: {
    type: String,
    enum: ['chat', 'mood', 'journal', 'manual'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  keywords: [{
    type: String
  }],
  content: {
    type: String // The message/entry that triggered detection
  },
  sentimentScore: {
    type: Number,
    min: -1,
    max: 1
  },
  interventionTaken: {
    type: String,
    enum: ['modal_shown', 'resources_provided', 'safety_plan_suggested', 'emergency_contact_notified', 'none'],
    default: 'none'
  },
  userResponse: {
    type: String,
    enum: ['acknowledged', 'dismissed', 'contacted_help', 'no_response'],
    default: 'no_response'
  },
  followUpScheduled: {
    type: Date
  },
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  followUpResponse: {
    mood: {
      type: Number,
      min: 1,
      max: 10
    },
    feeling: String,
    needsHelp: Boolean,
    notes: String
  },
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
crisisLogSchema.index({ userId: 1, createdAt: -1 });
crisisLogSchema.index({ severity: 1, resolved: 1 });
crisisLogSchema.index({ followUpScheduled: 1, followUpCompleted: 1 });

const CrisisLog = mongoose.model('CrisisLog', crisisLogSchema);

export default CrisisLog;
