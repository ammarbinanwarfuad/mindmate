import mongoose from 'mongoose';

const progressShareSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true
  },
  shareType: {
    type: String,
    enum: ['one-time', 'ongoing'],
    default: 'one-time'
  },
  dataTypes: [{
    type: String,
    enum: ['mood', 'journal', 'goals', 'wellness', 'cbt', 'analytics']
  }],
  dateRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  accessToken: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  lastViewedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  revokedAt: {
    type: Date
  },
  revokedReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
progressShareSchema.index({ userId: 1, therapistId: 1 });
progressShareSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model('ProgressShare', progressShareSchema);
