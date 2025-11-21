import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  user1Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  user2Id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  commonInterests: [String],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  availability: {
    user1: {
      status: {
        type: String,
        enum: ['online', 'offline', 'busy', 'available'],
        default: 'offline'
      },
      lastActive: Date,
      statusMessage: String
    },
    user2: {
      status: {
        type: String,
        enum: ['online', 'offline', 'busy', 'available'],
        default: 'offline'
      },
      lastActive: Date,
      statusMessage: String
    }
  },
  sosAlerts: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    responded: {
      type: Boolean,
      default: false
    },
    respondedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  rating: {
    user1Rating: {
      type: Number,
      min: 1,
      max: 5
    },
    user2Rating: {
      type: Number,
      min: 1,
      max: 5
    },
    user1Feedback: String,
    user2Feedback: String
  }
}, {
  timestamps: true
});

matchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
matchSchema.index({ status: 1 });

export default mongoose.model('Match', matchSchema);
