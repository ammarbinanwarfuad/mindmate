import mongoose from 'mongoose';

const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['google-calendar', 'outlook', 'fitbit', 'apple-health', 'spotify', 'sleep-tracker'],
    required: true
  },
  status: {
    type: String,
    enum: ['connected', 'disconnected', 'error'],
    default: 'connected'
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiry: {
    type: Date
  },
  providerUserId: {
    type: String
  },
  settings: {
    syncEnabled: {
      type: Boolean,
      default: true
    },
    syncFrequency: {
      type: String,
      enum: ['realtime', 'hourly', 'daily'],
      default: 'daily'
    },
    dataTypes: [{
      type: String
    }],
    lastSync: Date,
    autoSync: {
      type: Boolean,
      default: true
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  syncHistory: [{
    syncedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed']
    },
    itemsSynced: Number,
    errors: [String]
  }],
  lastError: {
    message: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// Indexes
integrationSchema.index({ userId: 1, provider: 1 }, { unique: true });
integrationSchema.index({ status: 1 });

// Method to check if token is expired
integrationSchema.methods.isTokenExpired = function() {
  if (!this.tokenExpiry) return false;
  return new Date() > this.tokenExpiry;
};

// Method to record sync
integrationSchema.methods.recordSync = function(status, itemsSynced, errors = []) {
  this.syncHistory.push({
    status,
    itemsSynced,
    errors
  });
  this.settings.lastSync = new Date();
  
  // Keep only last 50 sync records
  if (this.syncHistory.length > 50) {
    this.syncHistory = this.syncHistory.slice(-50);
  }
};

export default mongoose.model('Integration', integrationSchema);
