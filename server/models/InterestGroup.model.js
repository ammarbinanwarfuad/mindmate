import mongoose from 'mongoose';

const interestGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['mental-health', 'academic', 'hobbies', 'wellness', 'gaming', 'creative', 'support', 'social', 'other'],
    required: true
  },
  tags: [String],
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x200'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'invite-only'],
    default: 'public'
  },
  rules: [String],
  posts: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      content: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  events: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SocialEvent'
  }],
  resources: [{
    title: String,
    url: String,
    description: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
interestGroupSchema.index({ category: 1, active: 1 });
interestGroupSchema.index({ tags: 1 });
interestGroupSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('InterestGroup', interestGroupSchema);
