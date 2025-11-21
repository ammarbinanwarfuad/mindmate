import express from 'express';
import WellnessChallenge from '../models/WellnessChallenge.model.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/challenges
 * @desc    Get all challenges
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { type, category, status = 'active' } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;

    const challenges = await WellnessChallenge.find(query)
      .populate('createdBy', 'profile')
      .sort({ featured: -1, startDate: -1 });

    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/challenges/:id
 * @desc    Get challenge details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const challenge = await WellnessChallenge.findById(req.params.id)
      .populate('createdBy', 'profile')
      .populate('participants.userId', 'profile');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/challenges
 * @desc    Create challenge
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const challenge = await WellnessChallenge.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, challenge });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/challenges/:id/join
 * @desc    Join challenge
 * @access  Private
 */
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const challenge = await WellnessChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if already joined
    if (challenge.isParticipant(req.user._id)) {
      return res.status(400).json({ success: false, message: 'Already joined this challenge' });
    }

    // Check capacity
    if (challenge.participants.length >= challenge.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Challenge is full' });
    }

    challenge.participants.push({
      userId: req.user._id,
      progress: {
        completedDays: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        completedTasks: []
      }
    });

    await challenge.save();

    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   POST /api/challenges/:id/complete-day
 * @desc    Complete daily task
 * @access  Private
 */
router.post('/:id/complete-day', authenticate, async (req, res) => {
  try {
    const { day } = req.body;
    const challenge = await WellnessChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const participant = challenge.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(400).json({ success: false, message: 'Not a participant' });
    }

    // Check if day already completed
    const alreadyCompleted = participant.progress.completedTasks.some(t => t.day === day);
    if (alreadyCompleted) {
      return res.status(400).json({ success: false, message: 'Day already completed' });
    }

    // Find daily task
    const dailyTask = challenge.dailyTasks.find(t => t.day === day);
    const points = dailyTask?.points || challenge.points.daily;

    // Update progress
    participant.progress.completedTasks.push({
      day,
      completedAt: new Date(),
      points
    });
    participant.progress.completedDays += 1;
    participant.progress.totalPoints += points;
    participant.progress.lastCheckIn = new Date();

    // Update streak
    const today = new Date().setHours(0, 0, 0, 0);
    const lastCheckIn = participant.progress.lastCheckIn 
      ? new Date(participant.progress.lastCheckIn).setHours(0, 0, 0, 0)
      : null;
    
    if (!lastCheckIn || today - lastCheckIn === 86400000) {
      participant.progress.currentStreak += 1;
      if (participant.progress.currentStreak > participant.progress.longestStreak) {
        participant.progress.longestStreak = participant.progress.currentStreak;
      }
    } else if (today - lastCheckIn > 86400000) {
      participant.progress.currentStreak = 1;
    }

    // Check if challenge completed
    if (participant.progress.completedDays >= challenge.duration) {
      participant.status = 'completed';
      participant.completedAt = new Date();
      participant.progress.totalPoints += challenge.points.completion;
    }

    await challenge.save();

    res.json({ 
      success: true, 
      progress: participant.progress,
      status: participant.status
    });
  } catch (error) {
    console.error('Complete day error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/challenges/:id/leaderboard
 * @desc    Get challenge leaderboard
 * @access  Private
 */
router.get('/:id/leaderboard', authenticate, async (req, res) => {
  try {
    const leaderboard = await WellnessChallenge.getLeaderboard(req.params.id);
    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/challenges/:id/certificate
 * @desc    Get completion certificate
 * @access  Private
 */
router.get('/:id/certificate', authenticate, async (req, res) => {
  try {
    const challenge = await WellnessChallenge.findById(req.params.id);
    
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const participant = challenge.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!participant || participant.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Challenge not completed' });
    }

    // Mark certificate as issued
    participant.certificateIssued = true;
    await challenge.save();

    const certificate = {
      challengeTitle: challenge.title,
      userName: req.user.profile?.name || 'Participant',
      completedAt: participant.completedAt,
      duration: challenge.duration,
      totalPoints: participant.progress.totalPoints,
      longestStreak: participant.progress.longestStreak,
      badge: challenge.badge,
      certificateId: `${challenge._id}-${req.user._id}`.substring(0, 16).toUpperCase()
    };

    res.json({ success: true, certificate });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/challenges/my/active
 * @desc    Get user's active challenges
 * @access  Private
 */
router.get('/my/active', authenticate, async (req, res) => {
  try {
    const challenges = await WellnessChallenge.find({
      'participants.userId': req.user._id,
      'participants.status': 'active'
    }).populate('createdBy', 'profile');

    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Get my challenges error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @route   GET /api/challenges/my/completed
 * @desc    Get user's completed challenges
 * @access  Private
 */
router.get('/my/completed', authenticate, async (req, res) => {
  try {
    const challenges = await WellnessChallenge.find({
      'participants.userId': req.user._id,
      'participants.status': 'completed'
    }).populate('createdBy', 'profile');

    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Get completed challenges error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
