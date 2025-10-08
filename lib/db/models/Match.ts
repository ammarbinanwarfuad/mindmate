import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMatch extends Document {
  user1Id: Types.ObjectId;
  user2Id: Types.ObjectId;
  compatibilityScore: number;
  sharedStruggles: string[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  chatRoomId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>({
  user1Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  user2Id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  compatibilityScore: { type: Number, required: true },
  sharedStruggles: [String],
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },
  chatRoomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom' },
}, {
  timestamps: true
});

MatchSchema.index({ user1Id: 1, user2Id: 1 }, { unique: true });
MatchSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);