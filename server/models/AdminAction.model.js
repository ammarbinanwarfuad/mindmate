import mongoose from 'mongoose';

const adminActionSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: [
      // User Management
      'user_banned', 'user_suspended', 'user_deleted', 'user_warned', 'user_unbanned', 'user_unsuspended',
      // Content Moderation
      'post_deleted', 'post_hidden', 'post_restored', 'comment_deleted', 'comment_hidden', 'content_flagged',
      // Permissions
      'permission_granted', 'permission_revoked', 'permissions_updated',
      // Roles
      'role_assigned', 'role_removed', 'role_updated',
      // Content Management
      'challenge_created', 'challenge_updated', 'challenge_deleted',
      'resource_added', 'resource_updated', 'resource_deleted',
      'announcement_created', 'announcement_deleted',
      // Crisis Management
      'crisis_handled', 'crisis_escalated', 'emergency_contacted',
      // Data & Analytics
      'data_exported', 'report_reviewed', 'report_resolved',
      // System
      'settings_changed', 'system_config_updated'
    ],
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['user', 'post', 'comment', 'challenge', 'resource', 'announcement', 'report', 'system'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  details: {
    reason: String,
    notes: String,
    duration: Number, // For suspensions (in days)
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed,
    additionalData: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
adminActionSchema.index({ adminId: 1, timestamp: -1 });
adminActionSchema.index({ action: 1, timestamp: -1 });
adminActionSchema.index({ targetType: 1, targetId: 1 });
adminActionSchema.index({ timestamp: -1 });

// Static method to log an action
adminActionSchema.statics.logAction = async function(data) {
  try {
    const action = await this.create(data);
    return action;
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw error - logging shouldn't break the main operation
    return null;
  }
};

// Static method to get admin's action history
adminActionSchema.statics.getAdminHistory = async function(adminId, limit = 50) {
  return this.find({ adminId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('adminId', 'profile.name email role')
    .lean();
};

// Static method to get actions by type
adminActionSchema.statics.getActionsByType = async function(action, limit = 100) {
  return this.find({ action })
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('adminId', 'profile.name email role')
    .lean();
};

// Static method to get recent actions
adminActionSchema.statics.getRecentActions = async function(limit = 100, filters = {}) {
  const query = { ...filters };
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .populate('adminId', 'profile.name email role')
    .lean();
};

export default mongoose.model('AdminAction', adminActionSchema);
