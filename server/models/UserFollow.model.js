import mongoose from 'mongoose';

const userFollowSchema = new mongoose.Schema({
  followerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  followingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate follows
userFollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Virtual for checking if users follow each other
userFollowSchema.virtual('isMutual').get(async function() {
  const reverseFollow = await this.model('UserFollow').findOne({
    followerId: this.followingId,
    followingId: this.followerId
  });
  return !!reverseFollow;
});

export default mongoose.model('UserFollow', userFollowSchema);
