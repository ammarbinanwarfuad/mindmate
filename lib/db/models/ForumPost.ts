import mongoose, { Schema, Document, Types } from 'mongoose';

interface IComment {
  userId: Types.ObjectId;
  content: string;
  anonymous: boolean;
  createdAt: Date;
  likes: number;
}

export interface IForumPost extends Document {
  authorId: Types.ObjectId;
  title: string;
  content: string;
  category: string;
  isAnonymous: boolean;
  tags: string[];
  likes: number;
  likedBy: Types.ObjectId[];
  comments: IComment[];
  views: number;
  isPinned: boolean;
  isClosed: boolean;
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'removed';
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  anonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
});

const ForumPostSchema = new Schema<IForumPost>({
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true },
  isAnonymous: { type: Boolean, default: false },
  tags: [String],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [CommentSchema],
  views: { type: Number, default: 0 },
  isPinned: { type: Boolean, default: false },
  isClosed: { type: Boolean, default: false },
  moderationStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'flagged', 'removed'],
    default: 'approved'
  },
}, {
  timestamps: true
});

ForumPostSchema.index({ category: 1, createdAt: -1 });
ForumPostSchema.index({ authorId: 1 });

export default mongoose.models.ForumPost || mongoose.model<IForumPost>('ForumPost', ForumPostSchema);