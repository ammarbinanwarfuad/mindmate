import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { profileValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      profile: req.user.profile,
      preferences: req.user.preferences,
      privacy: req.user.privacy,
      photoHistory: req.user.photoHistory || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.patch('/profile', authenticate, profileValidation, validate, async (req, res) => {
  try {
    const { profile, preferences, privacy } = req.body;
    
    if (profile) {
      Object.assign(req.user.profile, profile);
    }
    
    if (preferences) {
      Object.assign(req.user.preferences, preferences);
    }
    
    if (privacy) {
      Object.assign(req.user.privacy, privacy);
    }
    
    req.user.lastActive = new Date();
    await req.user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: req.user.profile
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const MoodEntry = (await import('../models/MoodEntry.model.js')).default;
    const ForumPost = (await import('../models/ForumPost.model.js')).default;
    const Match = (await import('../models/Match.model.js')).default;
    
    const [moodCount, postCount, matchCount] = await Promise.all([
      MoodEntry.countDocuments({ userId: req.user._id }),
      ForumPost.countDocuments({ authorId: req.user._id }),
      Match.countDocuments({
        $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
        status: 'accepted'
      })
    ]);
    
    res.json({
      success: true,
      stats: {
        moodEntries: moodCount,
        forumPosts: postCount,
        matches: matchCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
