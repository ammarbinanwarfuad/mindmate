import mongoose from 'mongoose';

const cbtModuleSchema = new mongoose.Schema({
  moduleNumber: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  icon: String,
  duration: String, // e.g., "1 week"
  // Content
  lessons: [{
    title: String,
    content: String,
    videoUrl: String,
    duration: Number // in minutes
  }],
  // Exercises
  exercises: [{
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['thought-record', 'behavioral-activation', 'gratitude', 'quiz', 'reflection']
    },
    instructions: [String]
  }],
  // Resources
  resources: [{
    title: String,
    type: {
      type: String,
      enum: ['article', 'video', 'worksheet', 'audio']
    },
    url: String,
    description: String
  }],
  // Quiz
  quiz: [{
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String
  }],
  // Requirements
  prerequisites: [Number], // Module numbers that must be completed first
  isLocked: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// User Progress Schema
const userCBTProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  completedModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CBTModule'
    },
    completedAt: Date,
    score: Number,
    timeSpent: Number // in minutes
  }],
  currentModule: {
    type: Number,
    default: 1
  },
  lessonsCompleted: [{
    moduleNumber: Number,
    lessonIndex: Number,
    completedAt: Date
  }],
  exercisesCompleted: [{
    moduleNumber: Number,
    exerciseIndex: Number,
    completedAt: Date,
    notes: String
  }],
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export const CBTModule = mongoose.model('CBTModule', cbtModuleSchema);
export const UserCBTProgress = mongoose.model('UserCBTProgress', userCBTProgressSchema);
