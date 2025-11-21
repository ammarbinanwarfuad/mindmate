import mongoose from 'mongoose';

const notificationScheduleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  // Mood Reminders
  moodReminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    frequency: {
      type: String,
      enum: ['once', 'twice', 'thrice', 'custom'],
      default: 'twice'
    },
    times: [{
      hour: {
        type: Number,
        min: 0,
        max: 23
      },
      minute: {
        type: Number,
        min: 0,
        max: 59
      }
    }],
    message: {
      type: String,
      default: 'Time to check in with your mood 😊'
    }
  },
  // Goal Reminders
  goalReminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    time: {
      hour: {
        type: Number,
        default: 9
      },
      minute: {
        type: Number,
        default: 0
      }
    },
    message: {
      type: String,
      default: 'Don\'t forget to work on your goals today! 🎯'
    }
  },
  // Wellness Reminders
  wellnessReminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    time: {
      hour: {
        type: Number,
        default: 14
      },
      minute: {
        type: Number,
        default: 0
      }
    },
    message: {
      type: String,
      default: 'Take a moment for a wellness activity 🧘'
    }
  },
  // Journal Reminders
  journalReminders: {
    enabled: {
      type: Boolean,
      default: false
    },
    time: {
      hour: {
        type: Number,
        default: 20
      },
      minute: {
        type: Number,
        default: 0
      }
    },
    message: {
      type: String,
      default: 'Reflect on your day with a journal entry ✍️'
    }
  },
  // Inactivity Reminders
  inactivityReminders: {
    enabled: {
      type: Boolean,
      default: true
    },
    daysThreshold: {
      type: Number,
      default: 3,
      min: 1,
      max: 14
    },
    message: {
      type: String,
      default: 'We miss you! Come back and continue your wellness journey 💙'
    }
  },
  // Quiet Hours
  quietHours: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      hour: {
        type: Number,
        default: 22
      },
      minute: {
        type: Number,
        default: 0
      }
    },
    endTime: {
      hour: {
        type: Number,
        default: 8
      },
      minute: {
        type: Number,
        default: 0
      }
    }
  },
  // Push Notification Settings
  pushNotifications: {
    enabled: {
      type: Boolean,
      default: false
    },
    fcmToken: String,
    platform: {
      type: String,
      enum: ['web', 'ios', 'android']
    }
  },
  // Days of Week (for scheduled notifications)
  activeDays: {
    monday: { type: Boolean, default: true },
    tuesday: { type: Boolean, default: true },
    wednesday: { type: Boolean, default: true },
    thursday: { type: Boolean, default: true },
    friday: { type: Boolean, default: true },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true }
  },
  // Timezone
  timezone: {
    type: String,
    default: 'UTC'
  }
}, {
  timestamps: true
});

export default mongoose.model('NotificationSchedule', notificationScheduleSchema);
