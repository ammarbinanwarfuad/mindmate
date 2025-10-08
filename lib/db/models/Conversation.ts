import mongoose, { Schema, Document, Types } from 'mongoose';

interface IMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sentiment?: number;
}

export interface IConversation extends Document {
  userId: Types.ObjectId;
  messages: IMessage[];
  context: Record<string, any>;
  lastActive: Date;
}

const ConversationSchema = new Schema<IConversation>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    sentiment: Number
  }],
  context: { type: Schema.Types.Mixed, default: {} },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

ConversationSchema.index({ userId: 1, lastActive: -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);