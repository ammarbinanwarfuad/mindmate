import mongoose from 'mongoose';

const socialEventSchema = new mongoose.Schema({
  organizerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['study-session', 'game-night', 'meetup', 'workshop', 'support-group', 'social', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['mental-health', 'academic', 'social', 'wellness', 'gaming', 'creative', 'other']
  },
  format: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  location: {
    venue: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  onlineLink: {
    type: String
  },
  platform: {
    type: String,
    enum: ['zoom', 'google-meet', 'discord', 'teams', 'other']
  },
  maxAttendees: {
    type: Number,
    default: 50
  },
  attendees: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['going', 'maybe', 'not-going'],
      default: 'going'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  imageUrl: String,
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrence: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    endDate: Date
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'friends-only'],
    default: 'public'
  }
}, {
  timestamps: true
});

// Indexes
socialEventSchema.index({ date: 1, status: 1 });
socialEventSchema.index({ type: 1, format: 1 });
socialEventSchema.index({ 'location.city': 1 });
socialEventSchema.index({ tags: 1 });

export default mongoose.model('SocialEvent', socialEventSchema);
