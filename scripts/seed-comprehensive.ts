import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import { subDays, format } from 'date-fns';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

// Import models
import User from '../lib/db/models/User';
import MoodEntry from '../lib/db/models/MoodEntry';
import Conversation from '../lib/db/models/Conversation';
import ForumPost from '../lib/db/models/ForumPost';
import Match from '../lib/db/models/Match';
import Notification from '../lib/db/models/Notification';

const SAMPLE_USERS = [
  {
    email: 'alice@university.edu',
    password: 'Demo123!',
    name: 'Alice Johnson',
    university: 'State University',
    year: 2,
  },
  {
    email: 'bob@university.edu',
    password: 'Demo123!',
    name: 'Bob Smith',
    university: 'State University',
    year: 3,
  },
  {
    email: 'charlie@university.edu',
    password: 'Demo123!',
    name: 'Charlie Brown',
    university: 'Tech University',
    year: 1,
  },
  {
    email: 'diana@university.edu',
    password: 'Demo123!',
    name: 'Diana Prince',
    university: 'State University',
    year: 4,
  },
];

const MOOD_TRIGGERS = [
  'Academic stress',
  'Financial worries',
  'Social isolation',
  'Family issues',
  'Sleep problems',
  'Relationship issues',
];

const FORUM_CATEGORIES = [
  'academic',
  'anxiety',
  'relationships',
  'wellness',
  'success',
];

const SAMPLE_POSTS = [
  {
    title: 'How do you deal with exam anxiety?',
    content: 'Finals are coming up and I\'m feeling really overwhelmed. What strategies have worked for you?',
    category: 'academic',
  },
  {
    title: 'Meditation changed my life',
    content: 'Started daily meditation 3 months ago and my anxiety has significantly improved. Highly recommend!',
    category: 'wellness',
  },
  {
    title: 'Struggling with loneliness',
    content: 'Moved to a new city for college and finding it hard to make friends. Anyone else going through this?',
    category: 'anxiety',
  },
  {
    title: 'Finally talked to my parents',
    content: 'After months of therapy, I finally had an honest conversation with my parents about my mental health. It went better than expected!',
    category: 'success',
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting comprehensive database seeding...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      MoodEntry.deleteMany({}),
      Conversation.deleteMany({}),
      ForumPost.deleteMany({}),
      Match.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('✅ Data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of SAMPLE_USERS) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      const user = await User.create({
        email: userData.email,
        passwordHash,
        profile: {
          name: userData.name,
          university: userData.university,
          year: userData.year,
          anonymous: false,
        },
        preferences: {
          notifications: true,
          publicProfile: false,
          shareData: true,
        },
        privacy: {
          dataCollection: {
            allowAnalytics: false,
            allowResearch: false,
            allowPersonalization: true,
          },
          visibility: {
            profilePublic: false,
            showInMatching: true,
            allowMessages: 'matches',
          },
        },
        consent: {
          termsAccepted: true,
          termsVersion: '1.0',
          privacyAccepted: true,
          ageConfirmed: true,
          consentDate: new Date(),
        },
      });
      
      createdUsers.push(user);
      console.log(`   ✓ Created user: ${userData.email}`);
    }
    console.log(`✅ Created ${createdUsers.length} users\n`);

    // Create mood entries for each user (last 30 days)
    console.log('📊 Creating mood entries...');
    let totalMoodEntries = 0;
    
    for (const user of createdUsers) {
      for (let i = 0; i < 30; i++) {
        const date = subDays(new Date(), i);
        const moodScore = Math.floor(Math.random() * 6) + 4; // 4-9
        const triggers = MOOD_TRIGGERS
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.floor(Math.random() * 3));
        
        await MoodEntry.create({
          userId: user._id,
          date,
          moodScore,
          emoji: getMoodEmoji(moodScore),
          triggers,
          activities: ['Exercise', 'Meditation'].sort(() => 0.5 - Math.random()).slice(0, 2),
          sleepHours: Math.floor(Math.random() * 4) + 5,
          analyzedSentiment: 0,
        });
        totalMoodEntries++;
      }
    }
    console.log(`✅ Created ${totalMoodEntries} mood entries\n`);

    // Create conversations
    console.log('💬 Creating conversations...');
    for (const user of createdUsers.slice(0, 2)) {
      await Conversation.create({
        userId: user._id,
        messages: [
          {
            role: 'user',
            content: 'I\'m feeling stressed about my exams',
            timestamp: subDays(new Date(), 2),
            sentiment: -0.3,
          },
          {
            role: 'assistant',
            content: 'I hear that exam stress is really affecting you. That\'s completely valid. Let\'s work through this together. What specifically about the exams is causing you the most stress?',
            timestamp: subDays(new Date(), 2),
          },
        ],
        context: {},
        lastActive: subDays(new Date(), 2),
      });
    }
    console.log('✅ Created conversations\n');

    // Create forum posts
    console.log('📝 Creating forum posts...');
    for (let i = 0; i < SAMPLE_POSTS.length; i++) {
      const post = SAMPLE_POSTS[i];
      const author = createdUsers[i % createdUsers.length];
      
      await ForumPost.create({
        authorId: author._id,
        title: post.title,
        content: post.content,
        category: post.category,
        isAnonymous: Math.random() > 0.5,
        tags: [post.category],
        likes: Math.floor(Math.random() * 20),
        comments: [],
        views: Math.floor(Math.random() * 100),
        moderationStatus: 'approved',
      });
    }
    console.log(`✅ Created ${SAMPLE_POSTS.length} forum posts\n`);

    // Create matches
    console.log('🤝 Creating matches...');
    if (createdUsers.length >= 2) {
      await Match.create({
        user1Id: createdUsers[0]._id,
        user2Id: createdUsers[1]._id,
        compatibilityScore: 85,
        sharedStruggles: ['Academic stress', 'Sleep problems'],
        status: 'accepted',
      });
      
      await Match.create({
        user1Id: createdUsers[0]._id,
        user2Id: createdUsers[2]._id,
        compatibilityScore: 72,
        sharedStruggles: ['Social isolation'],
        status: 'pending',
      });
    }
    console.log('✅ Created matches\n');

    // Create notifications
    console.log('🔔 Creating notifications...');
    for (const user of createdUsers.slice(0, 2)) {
      await Notification.create({
        userId: user._id,
        type: 'milestone',
        title: 'Achievement Unlocked!',
        message: 'You\'ve logged your mood for 7 days in a row!',
        read: false,
      });
      
      await Notification.create({
        userId: user._id,
        type: 'match',
        title: 'New Match!',
        message: 'You have a new peer match with similar experiences',
        read: false,
        actionUrl: '/matches',
      });
    }
    console.log('✅ Created notifications\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Mood Entries: ${totalMoodEntries}`);
    console.log(`   Forum Posts: ${SAMPLE_POSTS.length}`);
    console.log(`   Matches: 2`);
    console.log(`   Notifications: ${createdUsers.slice(0, 2).length * 2}\n`);
    console.log('🔑 Test Credentials:');
    SAMPLE_USERS.forEach(user => {
      console.log(`   Email: ${user.email} | Password: ${user.password}`);
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

function getMoodEmoji(score: number): string {
  if (score >= 9) return '🥳';
  if (score >= 7) return '😄';
  if (score >= 5) return '🙂';
  if (score >= 3) return '😐';
  return '😟';
}

seedDatabase();