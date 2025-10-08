import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  profile: {
    name: string;
    university: string;
    year: number;
    anonymous: boolean;
  };
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    shareData: boolean;
  };
  privacy: {
    dataCollection: {
      allowAnalytics: boolean;
      allowResearch: boolean;
      allowPersonalization: boolean;
    };
    visibility: {
      profilePublic: boolean;
      showInMatching: boolean;
      allowMessages: string;
    };
  };
  consent: {
    termsAccepted: boolean;
    termsVersion: string;
    privacyAccepted: boolean;
    ageConfirmed: boolean;
    consentDate: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  profile: {
    name: { type: String, required: true },
    university: String,
    year: Number,
    anonymous: { type: Boolean, default: false }
  },
  preferences: {
    notifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: false },
    shareData: { type: Boolean, default: true }
  },
  privacy: {
    dataCollection: {
      allowAnalytics: { type: Boolean, default: false },
      allowResearch: { type: Boolean, default: false },
      allowPersonalization: { type: Boolean, default: true }
    },
    visibility: {
      profilePublic: { type: Boolean, default: false },
      showInMatching: { type: Boolean, default: true },
      allowMessages: { type: String, enum: ['everyone', 'matches', 'none'], default: 'matches' }
    }
  },
  consent: {
    termsAccepted: { type: Boolean, required: true },
    termsVersion: { type: String, required: true },
    privacyAccepted: { type: Boolean, required: true },
    ageConfirmed: { type: Boolean, required: true },
    consentDate: { type: Date, required: true }
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);