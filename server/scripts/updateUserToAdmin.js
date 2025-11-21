const mongoose = require('mongoose');
const User = require('../models/User.model');
require('dotenv').config();

const updateUserToAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the email to update
    const email = 'admin@mindmate.com'; // Change this if needed
    
    console.log(`\n🔍 Looking for user with email: ${email}`);
    
    // Find the user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('❌ User not found!');
      console.log('Please check the email address.');
      process.exit(1);
    }

    console.log('✅ User found!');
    console.log('Current user data:');
    console.log('- Name:', user.profile?.name || 'N/A');
    console.log('- Email:', user.email);
    console.log('- Current Role:', user.role || 'None');
    console.log('- Current Admin Level:', user.adminLevel || 'None');
    console.log('- Firebase UID:', user.firebaseUid || 'None');

    // Update the user
    user.role = 'super_admin';
    user.adminLevel = 'super_admin';
    user.permissions = ['*']; // All permissions
    user.status = 'active';
    
    await user.save();

    console.log('\n✅ User updated successfully!');
    console.log('New user data:');
    console.log('- Role:', user.role);
    console.log('- Admin Level:', user.adminLevel);
    console.log('- Permissions:', user.permissions);
    console.log('- Status:', user.status);

    console.log('\n🎉 Done! You can now access the admin panel.');
    console.log('Please refresh your browser and the purple shield should appear!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

updateUserToAdmin();
