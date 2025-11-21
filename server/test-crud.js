import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import MoodEntry from './models/MoodEntry.model.js';
import ForumPost from './models/ForumPost.model.js';

dotenv.config();

const testCRUD = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // ==================== USER CRUD ====================
    console.log('📝 Testing USER CRUD Operations...\n');

    // CREATE
    console.log('1️⃣ CREATE - Creating test user...');
    const testUser = await User.create({
      firebaseUid: `test_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      profile: {
        name: 'Test User',
        bio: 'This is a test user',
        university: 'Test University',
        year: 2024
      },
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        privacyAccepted: true,
        ageConfirmed: true,
        consentDate: new Date()
      }
    });
    console.log(`✅ User created: ${testUser.profile.name} (${testUser.email})`);
    console.log(`   ID: ${testUser._id}\n`);

    // READ
    console.log('2️⃣ READ - Fetching user by ID...');
    const foundUser = await User.findById(testUser._id);
    console.log(`✅ User found: ${foundUser.profile.name}`);
    console.log(`   Email: ${foundUser.email}\n`);

    // UPDATE
    console.log('3️⃣ UPDATE - Updating user profile...');
    foundUser.profile.bio = 'Updated bio for testing';
    foundUser.profile.headline = 'Software Developer';
    await foundUser.save();
    const updatedUser = await User.findById(testUser._id);
    console.log(`✅ User updated: ${updatedUser.profile.headline}`);
    console.log(`   Bio: ${updatedUser.profile.bio}\n`);

    // ==================== MOOD ENTRY CRUD ====================
    console.log('📊 Testing MOOD ENTRY CRUD Operations...\n');

    // CREATE
    console.log('1️⃣ CREATE - Creating mood entries...');
    const moodEntry1 = await MoodEntry.create({
      userId: testUser._id,
      moodScore: 8,
      emoji: '😊',
      triggers: ['exercise', 'good sleep'],
      activities: ['workout', 'meditation'],
      sleepHours: 8
    });
    
    const moodEntry2 = await MoodEntry.create({
      userId: testUser._id,
      moodScore: 6,
      emoji: '😐',
      triggers: ['work stress'],
      activities: ['work'],
      sleepHours: 6
    });
    console.log(`✅ Created 2 mood entries`);
    console.log(`   Entry 1: Mood ${moodEntry1.moodScore} ${moodEntry1.emoji}`);
    console.log(`   Entry 2: Mood ${moodEntry2.moodScore} ${moodEntry2.emoji}\n`);

    // READ
    console.log('2️⃣ READ - Fetching mood entries...');
    const moodEntries = await MoodEntry.find({ userId: testUser._id }).sort({ date: -1 });
    console.log(`✅ Found ${moodEntries.length} mood entries`);
    moodEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. Mood: ${entry.moodScore} ${entry.emoji} - ${entry.triggers.join(', ')}`);
    });
    console.log();

    // UPDATE
    console.log('3️⃣ UPDATE - Updating mood entry...');
    moodEntry1.aiInsights = 'Great mood! Keep up the good habits.';
    await moodEntry1.save();
    const updatedMood = await MoodEntry.findById(moodEntry1._id);
    console.log(`✅ Mood entry updated with AI insights`);
    console.log(`   Insights: ${updatedMood.aiInsights}\n`);

    // STATISTICS
    console.log('📈 STATISTICS - Calculating mood stats...');
    const avgMood = moodEntries.reduce((sum, e) => sum + e.moodScore, 0) / moodEntries.length;
    console.log(`✅ Average mood: ${avgMood.toFixed(1)}`);
    console.log(`   Total entries: ${moodEntries.length}\n`);

    // ==================== FORUM POST CRUD ====================
    console.log('💬 Testing FORUM POST CRUD Operations...\n');

    // CREATE
    console.log('1️⃣ CREATE - Creating forum post...');
    const forumPost = await ForumPost.create({
      authorId: testUser._id,
      title: 'Test Post - Dealing with Stress',
      content: 'This is a test post about managing stress in college.',
      tags: ['stress', 'college', 'mental-health'],
      anonymous: false
    });
    console.log(`✅ Forum post created: "${forumPost.title}"`);
    console.log(`   Tags: ${forumPost.tags.join(', ')}\n`);

    // READ
    console.log('2️⃣ READ - Fetching forum post with author...');
    const foundPost = await ForumPost.findById(forumPost._id)
      .populate('authorId', 'profile.name profile.profilePicture');
    console.log(`✅ Post found: "${foundPost.title}"`);
    console.log(`   Author: ${foundPost.authorId.profile.name}`);
    console.log(`   Views: ${foundPost.viewCount}\n`);

    // UPDATE - Add Comment
    console.log('3️⃣ UPDATE - Adding comment to post...');
    foundPost.comments.push({
      authorId: testUser._id,
      content: 'Great post! Very helpful.',
      anonymous: false,
      createdAt: new Date()
    });
    await foundPost.save();
    console.log(`✅ Comment added`);
    console.log(`   Total comments: ${foundPost.comments.length}\n`);

    // UPDATE - Add Reaction
    console.log('4️⃣ UPDATE - Adding reaction to post...');
    foundPost.reactedBy.push({
      userId: testUser._id,
      reactionType: 'helpful'
    });
    foundPost.reactions.helpful += 1;
    await foundPost.save();
    console.log(`✅ Reaction added`);
    console.log(`   Reactions: ${JSON.stringify(foundPost.reactions)}\n`);

    // READ - List all posts
    console.log('5️⃣ READ - Listing all posts...');
    const allPosts = await ForumPost.find()
      .populate('authorId', 'profile.name')
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(`✅ Found ${allPosts.length} posts`);
    allPosts.forEach((post, index) => {
      console.log(`   ${index + 1}. "${post.title}" by ${post.authorId?.profile?.name || 'Unknown'}`);
    });
    console.log();

    // ==================== DELETE OPERATIONS ====================
    console.log('🗑️  Testing DELETE Operations...\n');

    console.log('1️⃣ DELETE - Deleting mood entries...');
    await MoodEntry.deleteMany({ userId: testUser._id });
    const remainingMoods = await MoodEntry.countDocuments({ userId: testUser._id });
    console.log(`✅ Mood entries deleted. Remaining: ${remainingMoods}\n`);

    console.log('2️⃣ DELETE - Deleting forum post...');
    await ForumPost.deleteOne({ _id: forumPost._id });
    const remainingPosts = await ForumPost.countDocuments({ _id: forumPost._id });
    console.log(`✅ Forum post deleted. Remaining: ${remainingPosts}\n`);

    console.log('3️⃣ DELETE - Deleting test user...');
    await User.deleteOne({ _id: testUser._id });
    const remainingUsers = await User.countDocuments({ _id: testUser._id });
    console.log(`✅ User deleted. Remaining: ${remainingUsers}\n`);

    // ==================== SUMMARY ====================
    console.log('═══════════════════════════════════════════');
    console.log('✅ ALL CRUD OPERATIONS COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════');
    console.log('\n📊 Summary:');
    console.log('   ✓ User CRUD: Create, Read, Update, Delete');
    console.log('   ✓ Mood Entry CRUD: Create, Read, Update, Delete');
    console.log('   ✓ Forum Post CRUD: Create, Read, Update, Delete');
    console.log('   ✓ Relationships: User → MoodEntry, User → ForumPost');
    console.log('   ✓ Nested Updates: Comments, Reactions');
    console.log('   ✓ Population: Author details in posts');
    console.log('\n🎉 MongoDB CRUD operations are working properly!\n');

  } catch (error) {
    console.error('❌ Error during CRUD testing:', error);
    console.error('\nError details:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
};

// Run the test
testCRUD();
