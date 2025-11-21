import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  awardXP,
  getGamificationStats,
  getActiveChallenges,
  updateChallengeProgress,
  seedBadges,
  generateChallenges,
  cleanupExpiredChallenges
} from '../services/gamification.service.js';
import Badge from '../models/Badge.model.js';
import UserProgress from '../models/UserProgress.model.js';

const router = express.Router();

/**
 * @route   POST /api/gamification/xp
 * @desc    Award XP to user for an action
 * @access  Private
 */
router.post('/xp', authenticate, async (req, res) => {
  try {
    const { action, amount } = req.body;
    
    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }
    
    const result = await awardXP(req.user.id, action, amount);
    
    if (!result) {
      return res.status(400).json({ message: 'Invalid action or XP amount' });
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Award XP error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/gamification/stats
 * @desc    Get user's gamification stats
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await getGamificationStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/gamification/badges
 * @desc    Get all badges with user's unlock status
 * @access  Private
 */
router.get('/badges', authenticate, async (req, res) => {
  try {
    const allBadges = await Badge.find().sort({ category: 1, order: 1 });
    const progress = await UserProgress.findOne({ userId: req.user.id });
    
    const unlockedBadgeIds = progress?.unlockedBadges.map(b => b.badgeId.toString()) || [];
    
    const badgesWithStatus = allBadges.map(badge => {
      const isUnlocked = unlockedBadgeIds.includes(badge._id.toString());
      const unlockedData = progress?.unlockedBadges.find(
        b => b.badgeId.toString() === badge._id.toString()
      );
      
      return {
        ...badge.toObject(),
        unlocked: isUnlocked,
        unlockedAt: unlockedData?.unlockedAt || null
      };
    });
    
    res.json(badgesWithStatus);
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/gamification/challenges
 * @desc    Get active challenges with user's progress
 * @access  Private
 */
router.get('/challenges', authenticate, async (req, res) => {
  try {
    const challenges = await getActiveChallenges(req.user.id);
    res.json(challenges);
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/gamification/challenge-progress
 * @desc    Update challenge progress
 * @access  Private
 */
router.post('/challenge-progress', authenticate, async (req, res) => {
  try {
    const { action, amount } = req.body;
    
    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }
    
    const completedChallenges = await updateChallengeProgress(
      req.user.id,
      action,
      amount || 1
    );
    
    res.json({
      success: true,
      completedChallenges
    });
  } catch (error) {
    console.error('Update challenge progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Get leaderboard (top users by level/XP)
 * @access  Private
 */
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { type = 'level', limit = 10 } = req.query;
    
    const sortField = type === 'xp' ? 'totalXpEarned' : 'level';
    
    const topUsers = await UserProgress.find()
      .sort({ [sortField]: -1, totalXpEarned: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username avatar');
    
    const leaderboard = topUsers.map((progress, index) => ({
      rank: index + 1,
      userId: progress.userId._id,
      username: progress.userId.username,
      avatar: progress.userId.avatar,
      level: progress.level,
      xp: progress.xp,
      totalXpEarned: progress.totalXpEarned,
      badgesUnlocked: progress.badgesUnlocked,
      currentStreak: progress.currentStreak
    }));
    
    // Find current user's rank
    const userProgress = await UserProgress.findOne({ userId: req.user.id });
    if (userProgress) {
      const userRank = await UserProgress.countDocuments({
        [sortField]: { $gt: userProgress[sortField] }
      }) + 1;
      
      res.json({
        leaderboard,
        userRank,
        userStats: {
          level: userProgress.level,
          xp: userProgress.xp,
          totalXpEarned: userProgress.totalXpEarned,
          badgesUnlocked: userProgress.badgesUnlocked,
          currentStreak: userProgress.currentStreak
        }
      });
    } else {
      res.json({ leaderboard });
    }
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @route   POST /api/gamification/seed
 * @desc    Seed badges and generate challenges (admin/dev only)
 * @access  Private
 */
router.post('/seed', authenticate, async (req, res) => {
  try {
    await seedBadges();
    await generateChallenges();
    await cleanupExpiredChallenges();
    
    res.json({ message: 'Gamification data seeded successfully' });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
