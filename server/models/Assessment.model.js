import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['phq9', 'gad7', 'stress', 'burnout'],
    required: true
  },
  responses: [{
    question: String,
    questionIndex: Number,
    answer: Number
  }],
  totalScore: {
    type: Number,
    required: true
  },
  severity: {
    type: String,
    enum: ['none', 'minimal', 'mild', 'moderate', 'moderately-severe', 'severe'],
    required: true
  },
  interpretation: {
    type: String,
    required: true
  },
  recommendations: [{
    type: String
  }],
  completedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes
assessmentSchema.index({ userId: 1, type: 1, completedAt: -1 });
assessmentSchema.index({ userId: 1, completedAt: -1 });

// Static method to calculate PHQ-9 score
assessmentSchema.statics.calculatePHQ9 = function(responses) {
  const total = responses.reduce((sum, r) => sum + r.answer, 0);
  let severity, interpretation, recommendations;

  if (total <= 4) {
    severity = 'none';
    interpretation = 'None to minimal depression';
    recommendations = ['Continue healthy habits', 'Monitor your mood regularly'];
  } else if (total <= 9) {
    severity = 'mild';
    interpretation = 'Mild depression';
    recommendations = [
      'Consider lifestyle changes (exercise, sleep, diet)',
      'Practice stress management techniques',
      'Monitor symptoms - if they worsen, seek professional help'
    ];
  } else if (total <= 14) {
    severity = 'moderate';
    interpretation = 'Moderate depression';
    recommendations = [
      'Consider professional counseling or therapy',
      'Discuss treatment options with a healthcare provider',
      'Implement self-care strategies',
      'Reach out to support systems'
    ];
  } else if (total <= 19) {
    severity = 'moderately-severe';
    interpretation = 'Moderately severe depression';
    recommendations = [
      'Seek professional help from a mental health provider',
      'Consider medication evaluation',
      'Engage in therapy (CBT, interpersonal therapy)',
      'Build a strong support network'
    ];
  } else {
    severity = 'severe';
    interpretation = 'Severe depression';
    recommendations = [
      'Seek immediate professional help',
      'Contact a mental health crisis line if needed',
      'Consider intensive treatment options',
      'Ensure safety and support from loved ones'
    ];
  }

  return { totalScore: total, severity, interpretation, recommendations };
};

// Static method to calculate GAD-7 score
assessmentSchema.statics.calculateGAD7 = function(responses) {
  const total = responses.reduce((sum, r) => sum + r.answer, 0);
  let severity, interpretation, recommendations;

  if (total <= 4) {
    severity = 'minimal';
    interpretation = 'Minimal anxiety';
    recommendations = ['Continue healthy coping strategies', 'Practice relaxation techniques'];
  } else if (total <= 9) {
    severity = 'mild';
    interpretation = 'Mild anxiety';
    recommendations = [
      'Practice stress management techniques',
      'Consider mindfulness or meditation',
      'Maintain regular exercise and sleep',
      'Monitor symptoms'
    ];
  } else if (total <= 14) {
    severity = 'moderate';
    interpretation = 'Moderate anxiety';
    recommendations = [
      'Consider professional counseling',
      'Learn anxiety management techniques',
      'Practice deep breathing and relaxation',
      'Discuss with healthcare provider'
    ];
  } else {
    severity = 'severe';
    interpretation = 'Severe anxiety';
    recommendations = [
      'Seek professional help immediately',
      'Consider therapy (CBT, exposure therapy)',
      'Discuss medication options with provider',
      'Build strong support system'
    ];
  }

  return { totalScore: total, severity, interpretation, recommendations };
};

// Static method to calculate Stress score
assessmentSchema.statics.calculateStress = function(responses) {
  const total = responses.reduce((sum, r) => sum + r.answer, 0);
  let severity, interpretation, recommendations;

  if (total <= 10) {
    severity = 'minimal';
    interpretation = 'Low stress levels';
    recommendations = ['Maintain current stress management practices', 'Continue healthy lifestyle'];
  } else if (total <= 20) {
    severity = 'mild';
    interpretation = 'Mild stress';
    recommendations = [
      'Identify stress triggers',
      'Practice time management',
      'Engage in regular physical activity',
      'Ensure adequate sleep'
    ];
  } else if (total <= 30) {
    severity = 'moderate';
    interpretation = 'Moderate stress';
    recommendations = [
      'Implement stress reduction techniques',
      'Consider counseling or stress management programs',
      'Set boundaries and prioritize self-care',
      'Practice relaxation exercises daily'
    ];
  } else {
    severity = 'severe';
    interpretation = 'High stress levels';
    recommendations = [
      'Seek professional support',
      'Consider therapy or counseling',
      'Evaluate work-life balance',
      'Implement immediate stress reduction strategies',
      'Discuss with healthcare provider'
    ];
  }

  return { totalScore: total, severity, interpretation, recommendations };
};

export default mongoose.model('Assessment', assessmentSchema);
