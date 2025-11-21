import mongoose from 'mongoose';

const studyBuddySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  subjects: [{
    type: String,
    required: true
  }],
  studyGoals: {
    type: String,
    required: true
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    timeSlots: [{
      start: String,
      end: String
    }]
  }],
  preferredStudyStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading-writing', 'mixed'],
    default: 'mixed'
  },
  location: {
    type: String,
    enum: ['online', 'in-person', 'hybrid'],
    default: 'online'
  },
  city: String,
  university: String,
  yearOfStudy: String,
  bio: String,
  interests: [String],
  lookingFor: {
    type: String,
    enum: ['study-partner', 'tutor', 'study-group', 'accountability-buddy'],
    default: 'study-partner'
  },
  active: {
    type: Boolean,
    default: true
  },
  matches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  requests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
studyBuddySchema.index({ subjects: 1, active: 1 });
studyBuddySchema.index({ city: 1, active: 1 });
studyBuddySchema.index({ university: 1, active: 1 });

export default mongoose.model('StudyBuddy', studyBuddySchema);
