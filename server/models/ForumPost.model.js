import mongoose from 'mongoose';

const forumPostSchema = new mongoose.Schema({
  authorId: {
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
  tags: [String],
  anonymous: {
    type: Boolean,
    default: false
  },
  reactions: {
    supportive: {
      type: Number,
      default: 0
    },
    relatable: {
      type: Number,
      default: 0
    },
    helpful: {
      type: Number,
      default: 0
    }
  },
  reactedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reactionType: {
      type: String,
      enum: ['supportive', 'relatable', 'helpful']
    }
  }],
  comments: [{
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    anonymous: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  pinnedAt: Date,
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll'
  },
  // Repost fields
  isRepost: {
    type: Boolean,
    default: false
  },
  originalPostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  repostThoughts: {
    type: String
  },
  repostCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

forumPostSchema.index({ authorId: 1, createdAt: -1 });
forumPostSchema.index({ tags: 1 });
forumPostSchema.index({ isPinned: -1, createdAt: -1 });

export default mongoose.model('ForumPost', forumPostSchema);
