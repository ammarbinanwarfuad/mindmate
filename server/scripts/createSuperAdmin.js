import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

/**
 * Script to create a Super Admin account
 * Run with: node scripts/createSuperAdmin.js
 */

async function createSuperAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Super Admin details - CHANGE THESE!
    const superAdminData = {
      firebaseUid: 'super-admin-' + Date.now(), // Temporary UID
      email: 'admin@mindmate.com', // CHANGE THIS to your email
      profile: {
        name: 'Super Admin',
        university: 'MindMate HQ',
        year: 2024
      },
      role: 'super_admin',
      adminLevel: 'super_admin',
      permissions: ['*'], // All permissions
      status: 'active',
      isVerified: true,
      consent: {
        termsAccepted: true,
        termsVersion: '1.0',
        privacyAccepted: true,
        ageConfirmed: true,
        consentDate: new Date()
      }
    };

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      $or: [
        { role: 'super_admin' },
        { adminLevel: 'super_admin' },
        { email: superAdminData.email }
      ]
    });

    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists:');
      console.log(`   Email: ${existingSuperAdmin.email}`);
      console.log(`   Name: ${existingSuperAdmin.profile.name}`);
      console.log(`   Role: ${existingSuperAdmin.role}`);
      console.log(`   Admin Level: ${existingSuperAdmin.adminLevel}`);
      
      const { createInterface } = await import('readline');
      const readline = createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('\nDo you want to create another super admin? (yes/no): ', async (answer) => {
        if (answer.toLowerCase() !== 'yes') {
          console.log('❌ Cancelled');
          readline.close();
          process.exit(0);
        }
        
        readline.close();
        await createAdmin();
      });
    } else {
      await createAdmin();
    }

    async function createAdmin() {
      // Create super admin
      const superAdmin = await User.create(superAdminData);

      console.log('\n✅ Super Admin created successfully!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📧 Email: ${superAdmin.email}`);
      console.log(`👤 Name: ${superAdmin.profile.name}`);
      console.log(`🎯 Role: ${superAdmin.role}`);
      console.log(`🔑 Admin Level: ${superAdmin.adminLevel}`);
      console.log(`✨ Permissions: ALL (*)`);
      console.log(`🆔 User ID: ${superAdmin._id}`);
      console.log(`🔥 Firebase UID: ${superAdmin.firebaseUid}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      console.log('\n⚠️  IMPORTANT NEXT STEPS:');
      console.log('1. Create this user in Firebase Authentication');
      console.log('2. Update the firebaseUid in the database with the real Firebase UID');
      console.log('3. Set a strong password in Firebase');
      console.log('4. Enable 2FA for this account (recommended)');
      console.log('\n📝 To update Firebase UID, run:');
      console.log(`   db.users.updateOne({_id: ObjectId("${superAdmin._id}")}, {$set: {firebaseUid: "REAL_FIREBASE_UID"}})`);
      
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    process.exit(1);
  }
}

// Run the script
createSuperAdmin();
