import mongoose from 'mongoose';

const gratitudeEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  entries: [{
    text: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: [
        'people',
        'experiences',
        'things',
        'opportunities',
        'health',
        'nature',
        'achievements',
        'other'
      ]
    }
  }],
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: Number,
    min: 0,
    max: 10
  },
  reflection: String,
  photos: [String], // URLs to photos
  isPrivate: {
    type: Boolean,
    default: true
  },
  streak: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

gratitudeEntrySchema.index({ userId: 1, date: -1 });

export default mongoose.model('GratitudeEntry', gratitudeEntrySchema);
