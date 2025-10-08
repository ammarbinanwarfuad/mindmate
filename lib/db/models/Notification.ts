import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  userId: Types.ObjectId;
  type: 'match' | 'message' | 'comment' | 'like' | 'milestone' | 'reminder';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['match', 'message', 'comment', 'like', 'milestone', 'reminder'],
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  actionUrl: String,
  metadata: Schema.Types.Mixed,
}, {
  timestamps: true
});

NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);