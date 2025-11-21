import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WellnessChallenge from '../models/WellnessChallenge.model.js';

dotenv.config();

const challenges = [
  {
    title: "30-Day Meditation Journey",
    description: "Build a consistent meditation practice with daily guided sessions. Perfect for beginners and experienced meditators alike.",
    type: "30-day",
    category: "mindfulness",
    duration: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyTasks: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      task: `Day ${i + 1}: ${i < 7 ? '5-minute' : i < 14 ? '10-minute' : i < 21 ? '15-minute' : '20-minute'} meditation`,
      description: `Complete a ${i < 7 ? '5-minute' : i < 14 ? '10-minute' : i < 21 ? '15-minute' : '20-minute'} guided meditation session`,
      points: 10
    })),
    difficulty: "beginner",
    points: {
      completion: 100,
      daily: 10,
      bonus: 50
    },
    imageUrl: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400",
    badge: {
      name: "Meditation Master",
      icon: "🧘",
      color: "purple"
    },
    status: "active",
    featured: true,
    isGroup: false,
    maxParticipants: 1000
  },
  {
    title: "7-Day Sleep Optimization",
    description: "Improve your sleep quality with proven techniques. Track your sleep, establish routines, and wake up refreshed.",
    type: "weekly",
    category: "sleep",
    duration: 7,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    dailyTasks: [
      { day: 1, task: "Set a consistent bedtime", description: "Choose a bedtime and stick to it tonight", points: 10 },
      { day: 2, task: "No screens 1 hour before bed", description: "Avoid all screens 60 minutes before sleep", points: 10 },
      { day: 3, task: "Create a bedtime routine", description: "Develop a 15-minute wind-down routine", points: 10 },
      { day: 4, task: "Optimize bedroom temperature", description: "Set room to 65-68°F (18-20°C)", points: 10 },
      { day: 5, task: "Limit caffeine after 2 PM", description: "No coffee, tea, or energy drinks after 2 PM", points: 10 },
      { day: 6, task: "Practice relaxation techniques", description: "Try deep breathing or progressive muscle relaxation", points: 10 },
      { day: 7, task: "Track your sleep quality", description: "Rate your sleep quality and note improvements", points: 10 }
    ],
    difficulty: "beginner",
    points: {
      completion: 50,
      daily: 10,
      bonus: 25
    },
    imageUrl: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400",
    badge: {
      name: "Sleep Champion",
      icon: "😴",
      color: "blue"
    },
    status: "active",
    featured: true,
    isGroup: false,
    maxParticipants: 1000
  },
  {
    title: "21-Day Fitness Challenge",
    description: "Transform your fitness with 3 weeks of progressive workouts. Suitable for all fitness levels.",
    type: "group",
    category: "exercise",
    duration: 21,
    startDate: new Date(),
    endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    dailyTasks: Array.from({ length: 21 }, (_, i) => ({
      day: i + 1,
      task: `Day ${i + 1}: ${i % 7 === 0 ? 'Rest day - Light stretching' : i % 3 === 0 ? 'Cardio workout' : i % 3 === 1 ? 'Strength training' : 'Flexibility & core'}`,
      description: `Complete a ${i % 7 === 0 ? '10-minute stretching session' : '30-minute workout session'}`,
      points: i % 7 === 0 ? 5 : 15
    })),
    difficulty: "intermediate",
    points: {
      completion: 150,
      daily: 15,
      bonus: 75
    },
    imageUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400",
    badge: {
      name: "Fitness Warrior",
      icon: "💪",
      color: "green"
    },
    status: "active",
    featured: true,
    isGroup: true,
    maxParticipants: 100
  },
  {
    title: "14-Day Gratitude Practice",
    description: "Cultivate positivity and appreciation through daily gratitude exercises. Boost your mental well-being.",
    type: "custom",
    category: "gratitude",
    duration: 14,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    dailyTasks: [
      { day: 1, task: "Write 3 things you're grateful for", description: "List three things that made you happy today", points: 10 },
      { day: 2, task: "Thank someone who helped you", description: "Express gratitude to a person in your life", points: 10 },
      { day: 3, task: "Appreciate your body", description: "Write what you're grateful for about your health", points: 10 },
      { day: 4, task: "Gratitude for challenges", description: "Find something positive in a recent difficulty", points: 10 },
      { day: 5, task: "Appreciate nature", description: "Notice and appreciate something beautiful in nature", points: 10 },
      { day: 6, task: "Grateful for relationships", description: "Write about meaningful connections in your life", points: 10 },
      { day: 7, task: "Appreciate small moments", description: "Notice and savor small joys throughout the day", points: 10 },
      { day: 8, task: "Gratitude letter", description: "Write a letter to someone you appreciate (don't have to send)", points: 10 },
      { day: 9, task: "Appreciate your home", description: "List things you're grateful for about where you live", points: 10 },
      { day: 10, task: "Grateful for opportunities", description: "Reflect on opportunities you've been given", points: 10 },
      { day: 11, task: "Appreciate your skills", description: "Acknowledge abilities and talents you possess", points: 10 },
      { day: 12, task: "Gratitude meditation", description: "5-minute meditation focusing on gratitude", points: 10 },
      { day: 13, task: "Share gratitude publicly", description: "Post or share something you're grateful for", points: 10 },
      { day: 14, task: "Reflect on the journey", description: "Review your gratitude practice and its impact", points: 10 }
    ],
    difficulty: "beginner",
    points: {
      completion: 75,
      daily: 10,
      bonus: 35
    },
    imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400",
    badge: {
      name: "Gratitude Guru",
      icon: "🙏",
      color: "yellow"
    },
    status: "active",
    featured: false,
    isGroup: false,
    maxParticipants: 1000
  },
  {
    title: "30-Day Journaling Habit",
    description: "Develop a consistent journaling practice. Improve self-awareness, process emotions, and track personal growth.",
    type: "30-day",
    category: "creativity",
    duration: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyTasks: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      task: `Day ${i + 1}: Journal prompt - ${getJournalPrompt(i + 1)}`,
      description: "Spend 10-15 minutes writing in your journal",
      points: 10
    })),
    difficulty: "beginner",
    points: {
      completion: 100,
      daily: 10,
      bonus: 50
    },
    imageUrl: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400",
    badge: {
      name: "Journal Master",
      icon: "📝",
      color: "indigo"
    },
    status: "active",
    featured: false,
    isGroup: false,
    maxParticipants: 1000
  },
  {
    title: "7-Day Hydration Challenge",
    description: "Build a healthy hydration habit. Track your water intake and feel the benefits of proper hydration.",
    type: "weekly",
    category: "nutrition",
    duration: 7,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    dailyTasks: Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      task: `Day ${i + 1}: Drink 8 glasses of water`,
      description: "Track and complete 8 glasses (64oz) of water throughout the day",
      points: 10
    })),
    difficulty: "beginner",
    points: {
      completion: 50,
      daily: 10,
      bonus: 25
    },
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400",
    badge: {
      name: "Hydration Hero",
      icon: "💧",
      color: "cyan"
    },
    status: "active",
    featured: false,
    isGroup: false,
    maxParticipants: 1000
  },
  {
    title: "Group Study Challenge",
    description: "Join fellow learners in a 14-day intensive study challenge. Stay accountable and motivated together.",
    type: "group",
    category: "learning",
    duration: 14,
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    dailyTasks: Array.from({ length: 14 }, (_, i) => ({
      day: i + 1,
      task: `Day ${i + 1}: ${i % 7 === 6 ? 'Review and reflect on the week' : 'Study for 2 hours'}`,
      description: i % 7 === 6 ? 'Review what you learned this week and plan for next week' : 'Complete 2 focused study sessions (Pomodoro technique recommended)',
      points: i % 7 === 6 ? 20 : 15
    })),
    difficulty: "intermediate",
    points: {
      completion: 100,
      daily: 15,
      bonus: 50
    },
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
    badge: {
      name: "Study Champion",
      icon: "📚",
      color: "orange"
    },
    status: "active",
    featured: false,
    isGroup: true,
    maxParticipants: 50
  },
  {
    title: "30-Day Social Connection",
    description: "Strengthen relationships and build new connections. Combat loneliness and improve social well-being.",
    type: "30-day",
    category: "social",
    duration: 30,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    dailyTasks: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      task: `Day ${i + 1}: ${getSocialTask(i + 1)}`,
      description: "Complete today's social connection activity",
      points: 10
    })),
    difficulty: "beginner",
    points: {
      completion: 100,
      daily: 10,
      bonus: 50
    },
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
    badge: {
      name: "Social Butterfly",
      icon: "🦋",
      color: "pink"
    },
    status: "active",
    featured: false,
    isGroup: false,
    maxParticipants: 1000
  }
];

// Helper function for journal prompts
function getJournalPrompt(day) {
  const prompts = [
    "What made you smile today?",
    "Describe a challenge you overcame",
    "What are you looking forward to?",
    "Write about a meaningful relationship",
    "What did you learn today?",
    "Describe your ideal day",
    "What are you proud of?",
    "How do you want to grow?",
    "What brings you peace?",
    "Reflect on a recent success"
  ];
  return prompts[(day - 1) % prompts.length];
}

// Helper function for social tasks
function getSocialTask(day) {
  const tasks = [
    "Call a friend or family member",
    "Send a thoughtful message to someone",
    "Have a meaningful conversation",
    "Join a group activity or event",
    "Compliment someone genuinely",
    "Reach out to someone you haven't talked to in a while",
    "Share a meal with someone",
    "Help someone with something",
    "Express appreciation to someone",
    "Make plans with a friend"
  ];
  return tasks[(day - 1) % tasks.length];
}

async function seedChallenges() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing challenges (optional - comment out if you want to keep existing)
    // await WellnessChallenge.deleteMany({});
    // console.log('🗑️  Cleared existing challenges');

    // Insert challenges
    const result = await WellnessChallenge.insertMany(challenges);
    console.log(`✅ Successfully seeded ${result.length} challenges:`);
    
    result.forEach(challenge => {
      console.log(`   - ${challenge.title} (${challenge.type}, ${challenge.category})`);
    });

    console.log('\n🎉 Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    process.exit(1);
  }
}

seedChallenges();
