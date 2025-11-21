import mongoose from 'mongoose';

const cognitiveDistortionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  examples: [String],
  questions: [String],
  icon: {
    type: String,
    default: '🧠'
  },
  category: {
    type: String,
    enum: ['thinking-errors', 'emotional', 'behavioral'],
    default: 'thinking-errors'
  }
}, {
  timestamps: true
});

export default mongoose.model('CognitiveDistortion', cognitiveDistortionSchema);
