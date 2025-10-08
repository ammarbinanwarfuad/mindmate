export const APP_CONFIG = {
  name: 'MindMate',
  description: 'AI-Powered Mental Health Companion for Students',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  apiTimeout: 30000,
  version: '1.0.0',
};

export const MONGODB_CONFIG = {
  options: {
    maxPoolSize: 10,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },
};

// Changed from OPENAI_CONFIG to GEMINI_CONFIG
export const GEMINI_CONFIG = {
  model: 'gemini-pro',
  temperature: 0.7,
  maxOutputTokens: 500,
  topK: 40,
  topP: 0.95,
};

export const RATE_LIMITS = {
  chat: {
    windowMs: 15 * 60 * 1000,
    max: 50,
  },
  mood: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
};