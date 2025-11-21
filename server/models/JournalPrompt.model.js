import mongoose from 'mongoose';

const journalPromptSchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: [
      'gratitude',
      'reflection',
      'goals',
      'dreams',
      'self-discovery',
      'relationships',
      'mindfulness',
      'creativity',
      'challenges',
      'growth',
      'daily',
      'deep'
    ],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'deep'],
    default: 'medium'
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

journalPromptSchema.index({ category: 1, isActive: 1 });
journalPromptSchema.index({ difficulty: 1 });

export default mongoose.model('JournalPrompt', journalPromptSchema);

// 100+ Journal Prompts to seed the database
export const JOURNAL_PROMPTS = [
  // Gratitude (15)
  { prompt: "What are three things you're grateful for today?", category: "gratitude", difficulty: "easy", tags: ["daily", "positive"] },
  { prompt: "Who made a positive impact on your life recently and why?", category: "gratitude", difficulty: "medium", tags: ["relationships", "appreciation"] },
  { prompt: "What's a small moment from today that brought you joy?", category: "gratitude", difficulty: "easy", tags: ["daily", "mindfulness"] },
  { prompt: "Describe a place that makes you feel peaceful and grateful.", category: "gratitude", difficulty: "medium", tags: ["mindfulness", "peace"] },
  { prompt: "What skill or ability are you thankful to have?", category: "gratitude", difficulty: "easy", tags: ["self-appreciation"] },
  { prompt: "Write about a challenge that taught you something valuable.", category: "gratitude", difficulty: "medium", tags: ["growth", "learning"] },
  { prompt: "What aspect of your health are you most grateful for?", category: "gratitude", difficulty: "easy", tags: ["health", "wellness"] },
  { prompt: "Who in your life deserves more appreciation? Why?", category: "gratitude", difficulty: "medium", tags: ["relationships"] },
  { prompt: "What's something you have now that you once wished for?", category: "gratitude", difficulty: "medium", tags: ["reflection", "achievement"] },
  { prompt: "Describe a memory that always makes you smile.", category: "gratitude", difficulty: "easy", tags: ["memories", "happiness"] },
  { prompt: "What's a book, movie, or song you're grateful to have discovered?", category: "gratitude", difficulty: "easy", tags: ["culture", "inspiration"] },
  { prompt: "Write about a mistake that led to something good.", category: "gratitude", difficulty: "deep", tags: ["growth", "perspective"] },
  { prompt: "What's a simple pleasure you enjoyed today?", category: "gratitude", difficulty: "easy", tags: ["daily", "mindfulness"] },
  { prompt: "Who taught you an important life lesson?", category: "gratitude", difficulty: "medium", tags: ["learning", "relationships"] },
  { prompt: "What's something about yourself that you appreciate?", category: "gratitude", difficulty: "medium", tags: ["self-love", "confidence"] },

  // Reflection (15)
  { prompt: "What did you learn about yourself this week?", category: "reflection", difficulty: "medium", tags: ["weekly", "self-discovery"] },
  { prompt: "How have you grown in the past month?", category: "reflection", difficulty: "medium", tags: ["growth", "progress"] },
  { prompt: "What would you tell your younger self?", category: "reflection", difficulty: "deep", tags: ["wisdom", "perspective"] },
  { prompt: "Describe a moment when you felt truly alive.", category: "reflection", difficulty: "medium", tags: ["experiences", "emotions"] },
  { prompt: "What patterns do you notice in your thoughts lately?", category: "reflection", difficulty: "deep", tags: ["mindfulness", "awareness"] },
  { prompt: "How do you handle stress? Is it working for you?", category: "reflection", difficulty: "medium", tags: ["coping", "wellness"] },
  { prompt: "What's a belief you've changed your mind about?", category: "reflection", difficulty: "deep", tags: ["growth", "perspective"] },
  { prompt: "When do you feel most like yourself?", category: "reflection", difficulty: "medium", tags: ["identity", "authenticity"] },
  { prompt: "What's something you need to let go of?", category: "reflection", difficulty: "deep", tags: ["healing", "growth"] },
  { prompt: "How do you want to be remembered?", category: "reflection", difficulty: "deep", tags: ["values", "legacy"] },
  { prompt: "What makes you feel energized vs. drained?", category: "reflection", difficulty: "medium", tags: ["self-awareness", "energy"] },
  { prompt: "Describe your ideal day from start to finish.", category: "reflection", difficulty: "medium", tags: ["dreams", "lifestyle"] },
  { prompt: "What's a fear you've overcome or are working on?", category: "reflection", difficulty: "deep", tags: ["courage", "growth"] },
  { prompt: "How has your perspective on life changed recently?", category: "reflection", difficulty: "deep", tags: ["wisdom", "growth"] },
  { prompt: "What does success mean to you right now?", category: "reflection", difficulty: "medium", tags: ["values", "goals"] },

  // Goals (12)
  { prompt: "What's one goal you want to achieve this month?", category: "goals", difficulty: "easy", tags: ["planning", "motivation"] },
  { prompt: "What steps can you take today toward your biggest dream?", category: "goals", difficulty: "medium", tags: ["action", "dreams"] },
  { prompt: "What's holding you back from pursuing what you want?", category: "goals", difficulty: "deep", tags: ["obstacles", "self-awareness"] },
  { prompt: "Describe your life 5 years from now if everything goes right.", category: "goals", difficulty: "medium", tags: ["vision", "future"] },
  { prompt: "What skill do you want to develop and why?", category: "goals", difficulty: "easy", tags: ["learning", "growth"] },
  { prompt: "What's a small habit you want to build?", category: "goals", difficulty: "easy", tags: ["habits", "improvement"] },
  { prompt: "What would you do if you knew you couldn't fail?", category: "goals", difficulty: "medium", tags: ["dreams", "courage"] },
  { prompt: "What's one thing you can do this week to improve your well-being?", category: "goals", difficulty: "easy", tags: ["wellness", "self-care"] },
  { prompt: "What's a project you've been putting off? Why?", category: "goals", difficulty: "medium", tags: ["procrastination", "motivation"] },
  { prompt: "How do you want to grow as a person this year?", category: "goals", difficulty: "medium", tags: ["personal-development", "growth"] },
  { prompt: "What's a relationship you want to strengthen?", category: "goals", difficulty: "medium", tags: ["relationships", "connection"] },
  { prompt: "What does your best self look like?", category: "goals", difficulty: "deep", tags: ["vision", "identity"] },

  // Dreams (10)
  { prompt: "What was the last dream you remember? What might it mean?", category: "dreams", difficulty: "medium", tags: ["subconscious", "interpretation"] },
  { prompt: "If money wasn't an issue, how would you spend your time?", category: "dreams", difficulty: "medium", tags: ["values", "passion"] },
  { prompt: "What's a childhood dream you still think about?", category: "dreams", difficulty: "medium", tags: ["nostalgia", "aspirations"] },
  { prompt: "Describe your dream home in detail.", category: "dreams", difficulty: "easy", tags: ["lifestyle", "comfort"] },
  { prompt: "What adventure do you dream of having?", category: "dreams", difficulty: "easy", tags: ["travel", "experiences"] },
  { prompt: "If you could master any skill instantly, what would it be?", category: "dreams", difficulty: "easy", tags: ["aspirations", "talents"] },
  { prompt: "What's a cause you dream of contributing to?", category: "dreams", difficulty: "medium", tags: ["purpose", "impact"] },
  { prompt: "Describe your dream career or calling.", category: "dreams", difficulty: "medium", tags: ["purpose", "work"] },
  { prompt: "What's a place you dream of visiting? Why?", category: "dreams", difficulty: "easy", tags: ["travel", "exploration"] },
  { prompt: "What legacy do you dream of leaving?", category: "dreams", difficulty: "deep", tags: ["purpose", "impact"] },

  // Self-Discovery (12)
  { prompt: "What are your core values? Are you living by them?", category: "self-discovery", difficulty: "deep", tags: ["values", "authenticity"] },
  { prompt: "What makes you unique?", category: "self-discovery", difficulty: "medium", tags: ["identity", "strengths"] },
  { prompt: "When do you feel most confident?", category: "self-discovery", difficulty: "medium", tags: ["confidence", "strengths"] },
  { prompt: "What's your relationship with yourself like?", category: "self-discovery", difficulty: "deep", tags: ["self-love", "awareness"] },
  { prompt: "What are you naturally good at?", category: "self-discovery", difficulty: "easy", tags: ["strengths", "talents"] },
  { prompt: "What do you need more of in your life?", category: "self-discovery", difficulty: "medium", tags: ["needs", "balance"] },
  { prompt: "What do you need less of?", category: "self-discovery", difficulty: "medium", tags: ["boundaries", "wellness"] },
  { prompt: "How do you express love and care?", category: "self-discovery", difficulty: "medium", tags: ["love-language", "relationships"] },
  { prompt: "What's your biggest strength? Your biggest weakness?", category: "self-discovery", difficulty: "medium", tags: ["self-awareness", "growth"] },
  { prompt: "What brings you inner peace?", category: "self-discovery", difficulty: "medium", tags: ["peace", "mindfulness"] },
  { prompt: "What's your relationship with change?", category: "self-discovery", difficulty: "deep", tags: ["adaptability", "growth"] },
  { prompt: "What parts of yourself are you still discovering?", category: "self-discovery", difficulty: "deep", tags: ["growth", "identity"] },

  // Relationships (10)
  { prompt: "Who do you feel most yourself around? Why?", category: "relationships", difficulty: "medium", tags: ["connection", "authenticity"] },
  { prompt: "What's the most important quality in a friend?", category: "relationships", difficulty: "easy", tags: ["friendship", "values"] },
  { prompt: "How do you show people you care about them?", category: "relationships", difficulty: "medium", tags: ["love", "expression"] },
  { prompt: "What's a conversation you need to have?", category: "relationships", difficulty: "deep", tags: ["communication", "courage"] },
  { prompt: "Who inspires you and why?", category: "relationships", difficulty: "easy", tags: ["inspiration", "role-models"] },
  { prompt: "What boundary do you need to set?", category: "relationships", difficulty: "deep", tags: ["boundaries", "self-care"] },
  { prompt: "How have your relationships shaped who you are?", category: "relationships", difficulty: "deep", tags: ["influence", "growth"] },
  { prompt: "What do you appreciate most about your closest friend?", category: "relationships", difficulty: "easy", tags: ["friendship", "gratitude"] },
  { prompt: "How do you handle conflict in relationships?", category: "relationships", difficulty: "medium", tags: ["communication", "conflict-resolution"] },
  { prompt: "What kind of friend/partner/family member do you want to be?", category: "relationships", difficulty: "medium", tags: ["values", "growth"] },

  // Mindfulness (10)
  { prompt: "What sensations do you notice in your body right now?", category: "mindfulness", difficulty: "easy", tags: ["body-awareness", "present"] },
  { prompt: "Describe this moment without judgment.", category: "mindfulness", difficulty: "medium", tags: ["present", "awareness"] },
  { prompt: "What emotions are you feeling right now? Where do you feel them?", category: "mindfulness", difficulty: "medium", tags: ["emotions", "body-awareness"] },
  { prompt: "What can you see, hear, smell, taste, and touch right now?", category: "mindfulness", difficulty: "easy", tags: ["senses", "grounding"] },
  { prompt: "What thoughts keep coming back to you today?", category: "mindfulness", difficulty: "medium", tags: ["thoughts", "patterns"] },
  { prompt: "How is your breath right now? Fast, slow, shallow, deep?", category: "mindfulness", difficulty: "easy", tags: ["breathing", "awareness"] },
  { prompt: "What's one thing you can appreciate about this present moment?", category: "mindfulness", difficulty: "easy", tags: ["gratitude", "present"] },
  { prompt: "What are you resisting right now?", category: "mindfulness", difficulty: "deep", tags: ["acceptance", "awareness"] },
  { prompt: "How does your body feel after today's activities?", category: "mindfulness", difficulty: "easy", tags: ["body-awareness", "reflection"] },
  { prompt: "What would it feel like to fully accept this moment?", category: "mindfulness", difficulty: "deep", tags: ["acceptance", "peace"] },

  // Creativity (8)
  { prompt: "If your life was a book, what would this chapter be called?", category: "creativity", difficulty: "medium", tags: ["metaphor", "reflection"] },
  { prompt: "Write a letter to your future self.", category: "creativity", difficulty: "medium", tags: ["future", "advice"] },
  { prompt: "Describe your current mood as a weather pattern.", category: "creativity", difficulty: "easy", tags: ["emotions", "metaphor"] },
  { prompt: "If you could have dinner with anyone, who and why?", category: "creativity", difficulty: "easy", tags: ["imagination", "conversation"] },
  { prompt: "What color represents your current state of mind?", category: "creativity", difficulty: "easy", tags: ["emotions", "expression"] },
  { prompt: "Write about your day as if it were an adventure story.", category: "creativity", difficulty: "medium", tags: ["storytelling", "perspective"] },
  { prompt: "If you were a character in a movie, what would your theme song be?", category: "creativity", difficulty: "easy", tags: ["identity", "music"] },
  { prompt: "Describe yourself using only metaphors.", category: "creativity", difficulty: "medium", tags: ["identity", "creativity"] },

  // Challenges (8)
  { prompt: "What's the hardest thing you're dealing with right now?", category: "challenges", difficulty: "deep", tags: ["struggles", "honesty"] },
  { prompt: "How have you overcome difficult times before?", category: "challenges", difficulty: "medium", tags: ["resilience", "strength"] },
  { prompt: "What's a mistake you made recently? What did you learn?", category: "challenges", difficulty: "medium", tags: ["learning", "growth"] },
  { prompt: "What would you tell a friend going through what you're experiencing?", category: "challenges", difficulty: "medium", tags: ["self-compassion", "perspective"] },
  { prompt: "What support do you need right now?", category: "challenges", difficulty: "medium", tags: ["needs", "help"] },
  { prompt: "How are you being hard on yourself?", category: "challenges", difficulty: "deep", tags: ["self-compassion", "awareness"] },
  { prompt: "What's something difficult you're avoiding?", category: "challenges", difficulty: "deep", tags: ["avoidance", "courage"] },
  { prompt: "What gives you strength during tough times?", category: "challenges", difficulty: "medium", tags: ["resilience", "coping"] },

  // Growth (10)
  { prompt: "What's the most important lesson you've learned recently?", category: "growth", difficulty: "medium", tags: ["learning", "wisdom"] },
  { prompt: "How are you different from who you were a year ago?", category: "growth", difficulty: "medium", tags: ["change", "progress"] },
  { prompt: "What comfort zone do you want to step out of?", category: "growth", difficulty: "medium", tags: ["courage", "expansion"] },
  { prompt: "What's a limiting belief you're ready to challenge?", category: "growth", difficulty: "deep", tags: ["mindset", "transformation"] },
  { prompt: "How do you want to evolve as a person?", category: "growth", difficulty: "deep", tags: ["vision", "development"] },
  { prompt: "What feedback have you received that resonated with you?", category: "growth", difficulty: "medium", tags: ["learning", "awareness"] },
  { prompt: "What's a habit you've successfully changed?", category: "growth", difficulty: "easy", tags: ["habits", "achievement"] },
  { prompt: "What does personal growth mean to you?", category: "growth", difficulty: "medium", tags: ["values", "philosophy"] },
  { prompt: "What's something you're learning to accept about yourself?", category: "growth", difficulty: "deep", tags: ["acceptance", "self-love"] },
  { prompt: "How do you celebrate your progress?", category: "growth", difficulty: "easy", tags: ["achievement", "self-appreciation"] },

  // Daily (5)
  { prompt: "How are you feeling today, really?", category: "daily", difficulty: "easy", tags: ["check-in", "emotions"] },
  { prompt: "What went well today?", category: "daily", difficulty: "easy", tags: ["positive", "reflection"] },
  { prompt: "What challenged you today?", category: "daily", difficulty: "easy", tags: ["challenges", "reflection"] },
  { prompt: "What's one thing you're looking forward to?", category: "daily", difficulty: "easy", tags: ["anticipation", "positive"] },
  { prompt: "What made you laugh or smile today?", category: "daily", difficulty: "easy", tags: ["joy", "happiness"] },

  // Deep (5)
  { prompt: "What are you afraid of? Why?", category: "deep", difficulty: "deep", tags: ["fear", "vulnerability"] },
  { prompt: "What does happiness mean to you?", category: "deep", difficulty: "deep", tags: ["philosophy", "values"] },
  { prompt: "What would you do differently if you could start over?", category: "deep", difficulty: "deep", tags: ["regrets", "wisdom"] },
  { prompt: "What's the meaning you're creating in your life?", category: "deep", difficulty: "deep", tags: ["purpose", "philosophy"] },
  { prompt: "What truth are you avoiding?", category: "deep", difficulty: "deep", tags: ["honesty", "awareness"] }
];
