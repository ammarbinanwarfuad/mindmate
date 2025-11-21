import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  credentials: {
    type: String,
    required: true
  },
  specializations: [{
    type: String,
    enum: ['anxiety', 'depression', 'trauma', 'relationships', 'addiction', 'eating-disorders', 'grief', 'stress', 'bipolar', 'ocd', 'ptsd', 'general']
  }],
  bio: {
    type: String,
    required: true
  },
  photo: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  experience: {
    type: Number,
    required: true
  },
  languages: [{
    type: String,
    default: ['English']
  }],
  sessionTypes: [{
    type: String,
    enum: ['in-person', 'video', 'phone', 'chat']
  }],
  pricing: {
    individual: {
      type: Number,
      required: true
    },
    couples: Number,
    group: Number
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    slots: [{
      start: String,
      end: String
    }]
  }],
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    email: {
      type: String,
      required: true
    },
    phone: String,
    website: String
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  verified: {
    type: Boolean,
    default: false
  },
  acceptingNewClients: {
    type: Boolean,
    default: true
  },
  insurance: [{
    type: String
  }],
  teletherapyPlatform: {
    type: String,
    enum: ['zoom', 'google-meet', 'doxy.me', 'vsee', 'other']
  }
}, {
  timestamps: true
});

// Indexes for search
therapistSchema.index({ name: 'text', bio: 'text' });
therapistSchema.index({ specializations: 1 });
therapistSchema.index({ 'location.city': 1 });
therapistSchema.index({ rating: -1 });

export default mongoose.model('Therapist', therapistSchema);
