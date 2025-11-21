import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // ROLE & PERMISSIONS SYSTEM
  role: {
    type: String,
    enum: ['student', 'teacher', 'therapist', 'helper', 'advisor', 'moderator', 'admin', 'super_admin'],
    default: 'student'
  },
  
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'advisor', 'helper', null],
    default: null
  },
  
  permissions: [{
    type: String,
    enum: [
      '*', // Wildcard - all permissions (for super admin)
      // User Management
      'view_users', 'ban_users', 'delete_users', 'suspend_users', 'warn_users', 'edit_permissions',
      // Content Moderation
      'delete_posts', 'hide_posts', 'delete_comments', 'review_reports',
      // Crisis Management
      'view_crisis', 'handle_crisis', 'contact_emergency',
      // Analytics
      'view_analytics', 'export_data', 'view_user_analytics',
      // Content Management
      'create_challenges', 'edit_challenges', 'delete_challenges', 'manage_resources', 'create_announcements',
      // Admin Management
      'create_admins', 'create_moderators', 'create_advisors', 'create_helpers', 'revoke_roles',
      // System
      'system_settings', 'database_access', 'api_config'
    ]
  }],
  
  // User-specific toggleable permissions (controlled by admin)
  userPermissions: {
    canCreatePosts: { type: Boolean, default: true },
    canComment: { type: Boolean, default: true },
    canSendMessages: { type: Boolean, default: true },
    canJoinGroups: { type: Boolean, default: true },
    canCreateChallenges: { type: Boolean, default: false },
    profileVisible: { type: Boolean, default: true }
  },
  
  // User Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'pending'],
    default: 'active'
  },
  
  suspensionDetails: {
    reason: String,
    suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    suspendedAt: Date,
    suspendedUntil: Date
  },
  
  banDetails: {
    reason: String,
    bannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bannedAt: Date,
    permanent: { type: Boolean, default: false }
  },
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: Date,
  
  profile: {
    name: {
      type: String,
      required: true
    },
    headline: String,
    university: String,
    year: Number,
    anonymous: {
      type: Boolean,
      default: false
    },
    bio: String,
    about: String,
    profilePicture: String,
    coverPhoto: String,
    education: [{
      school: String,
      degree: String,
      fieldOfStudy: String,
      startDate: String,
      endDate: String,
      description: String
    }],
    experience: [{
      company: String,
      title: String,
      employmentType: String,
      location: String,
      startDate: String,
      endDate: String,
      currentlyWorking: Boolean,
      description: String
    }]
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    publicProfile: {
      type: Boolean,
      default: false
    },
    shareData: {
      type: Boolean,
      default: true
    }
  },
  privacy: {
    dataCollection: {
      allowAnalytics: {
        type: Boolean,
        default: false
      },
      allowResearch: {
        type: Boolean,
        default: false
      },
      allowPersonalization: {
        type: Boolean,
        default: true
      }
    },
    visibility: {
      profilePublic: {
        type: Boolean,
        default: false
      },
      showInMatching: {
        type: Boolean,
        default: true
      },
      allowMessages: {
        type: String,
        enum: ['everyone', 'matches', 'none'],
        default: 'matches'
      }
    },
    showActiveStatus: {
      type: Boolean,
      default: true
    }
  },
  photoHistory: [{
    url: String,
    publicId: String,
    type: {
      type: String,
      enum: ['profilePicture', 'coverPhoto', 'general'],
      default: 'general'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActive: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  consent: {
    termsAccepted: {
      type: Boolean,
      required: true
    },
    termsVersion: {
      type: String,
      required: true
    },
    privacyAccepted: {
      type: Boolean,
      required: true
    },
    ageConfirmed: {
      type: Boolean,
      required: true
    },
    consentDate: {
      type: Date,
      required: true
    }
  }
}, {
  timestamps: true
});

// Indexes (email and firebaseUid already indexed via unique: true)
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ adminLevel: 1 });
userSchema.index({ 'profile.university': 1 });

export default mongoose.model('User', userSchema);
