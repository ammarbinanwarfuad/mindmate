import express from 'express';
import User from '../models/User.model.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        profile: req.user.profile,
        preferences: req.user.preferences,
        privacy: req.user.privacy,
        role: req.user.role,
        adminLevel: req.user.adminLevel,
        permissions: req.user.permissions,
        status: req.user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sync user from Firebase
router.post('/sync', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    
    let user = req.user;
    
    if (name && name !== user.profile.name) {
      user.profile.name = name;
      await user.save();
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        role: user.role,
        adminLevel: user.adminLevel,
        permissions: user.permissions,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Logout (update last active)
router.post('/logout', authenticate, async (req, res) => {
  try {
    req.user.isOnline = false;
    req.user.lastActive = new Date();
    await req.user.save();
    
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
