import mongoose from 'mongoose';

const safetyPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  warningSignals: [{
    type: String,
    trim: true
  }],
  copingStrategies: [{
    type: String,
    trim: true
  }],
  distractions: [{
    type: String,
    trim: true
  }],
  socialSupport: [{
    name: String,
    relationship: String,
    phone: String,
    notes: String
  }],
  professionalContacts: [{
    name: String,
    role: String,
    phone: String,
    address: String,
    notes: String
  }],
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    isPrimary: Boolean
  }],
  safeEnvironment: [{
    action: String,
    completed: Boolean
  }],
  reasonsToLive: [{
    type: String,
    trim: true
  }],
  crisisHotlines: [{
    name: String,
    phone: String,
    available: String,
    description: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated on save
safetyPlanSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

const SafetyPlan = mongoose.model('SafetyPlan', safetyPlanSchema);

export default SafetyPlan;

// Default crisis hotlines
export const DEFAULT_HOTLINES = [
  {
    name: '988 Suicide & Crisis Lifeline',
    phone: '988',
    available: '24/7',
    description: 'Free and confidential support for people in distress'
  },
  {
    name: 'Crisis Text Line',
    phone: '741741',
    available: '24/7',
    description: 'Text HOME to 741741 for free crisis counseling'
  },
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '1-800-273-8255',
    available: '24/7',
    description: 'Free and confidential emotional support'
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    available: '24/7',
    description: 'Treatment referral and information service'
  },
  {
    name: 'Veterans Crisis Line',
    phone: '1-800-273-8255 (Press 1)',
    available: '24/7',
    description: 'Support for veterans and their families'
  },
  {
    name: 'The Trevor Project (LGBTQ)',
    phone: '1-866-488-7386',
    available: '24/7',
    description: 'Crisis support for LGBTQ young people'
  }
];
