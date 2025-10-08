import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  profile: {
    name: String,
    university: String,
    year: Number,
    anonymous: Boolean,
  },
  consent: {
    termsAccepted: Boolean,
    termsVersion: String,
    privacyAccepted: Boolean,
    ageConfirmed: Boolean,
    consentDate: Date,
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo user exists
    const existingUser = await User.findOne({ email: 'demo@mindmate.com' });
    
    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Create demo user
    const passwordHash = await bcrypt.hash('Demo123!', 12);
    
    await User.create({
      email: 'demo@mindmate.com',
      passwordHash,
      profile: {
        name: 'Demo User',
        university: 'Demo University',
        year: 2,
        anonymous: false,
      },
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        privacyAccepted: true,
        ageConfirmed: true,
        consentDate: new Date(),
      },
    });

    console.log('✅ Demo user created');
    console.log('   Email: demo@mindmate.com');
    console.log('   Password: Demo123!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();