import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  therapistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true
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
  duration: {
    type: Number,
    default: 60
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'phone', 'chat'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  reason: {
    type: String
  },
  meetingLink: {
    type: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  cancellationReason: {
    type: String
  },
  cancelledBy: {
    type: String,
    enum: ['user', 'therapist']
  },
  cancelledAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
appointmentSchema.index({ userId: 1, date: -1 });
appointmentSchema.index({ therapistId: 1, date: 1 });
appointmentSchema.index({ status: 1, date: 1 });

export default mongoose.model('Appointment', appointmentSchema);
