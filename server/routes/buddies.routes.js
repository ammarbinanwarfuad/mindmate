import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Match from '../models/Match.model.js';
import CheckIn from '../models/CheckIn.model.js';
import SharedActivity from '../models/SharedActivity.model.js';
import BuddyGoal from '../models/BuddyGoal.model.js';

const router = express.Router();

/**
 * @route   POST /api/buddies/check-in
 * @desc    Schedule a check-in with buddy
 * @access  Private
 */
router.post('/check-in', authenticate, async (req, res) => {
  try {
    const { matchId, scheduledFor, title, description, frequency } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: 'accepted'
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const checkIn = await CheckIn.create({
      matchId,
      scheduledBy: req.user._id,
      scheduledFor,
      title,
      description,
      frequency,
      isRecurring: frequency !== 'once'
    });

    res.status(201).json({
      success: true,
      message: 'Check-in scheduled',
      checkIn
    });

  } catch (error) {
    console.error('Error scheduling check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule check-in',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/buddies/check-ins
 * @desc    Get check-ins for user's matches
 * @access  Private
 */
router.get('/check-ins', authenticate, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: 'accepted'
    });

    const matchIds = matches.map(m => m._id);

    const checkIns = await CheckIn.find({
      matchId: { $in: matchIds }
    })
      .populate('matchId')
      .populate('scheduledBy', 'profile.name')
      .sort({ scheduledFor: 1 });

    res.json({
      success: true,
      checkIns
    });

  } catch (error) {
    console.error('Error fetching check-ins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-ins',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/buddies/check-in/:id/complete
 * @desc    Mark check-in as complete
 * @access  Private
 */
router.post('/check-in/:id/complete', authenticate, async (req, res) => {
  try {
    const { notes } = req.body;

    const checkIn = await CheckIn.findById(req.params.id);

    if (!checkIn) {
      return res.status(404).json({
        success: false,
        message: 'Check-in not found'
      });
    }

    checkIn.completed = true;
    checkIn.completedAt = new Date();
    checkIn.completedBy = req.user._id;
    checkIn.notes = notes;

    await checkIn.save();

    res.json({
      success: true,
      message: 'Check-in completed',
      checkIn
    });

  } catch (error) {
    console.error('Error completing check-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete check-in',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/buddies/icebreakers
 * @desc    Get random icebreaker prompts
 * @access  Private
 */
router.get('/icebreakers', authenticate, async (req, res) => {
  try {
    const icebreakers = [
      "What's the best thing that happened to you this week?",
      "If you could have dinner with anyone, who would it be?",
      "What's your favorite way to practice self-care?",
      "What's a goal you're working towards right now?",
      "What makes you feel most relaxed?",
      "What's something you're grateful for today?",
      "If you could learn any skill instantly, what would it be?",
      "What's your favorite memory from childhood?",
      "What's one thing you'd like to accomplish this month?",
      "What's your go-to activity when you need to de-stress?",
      "What's something new you tried recently?",
      "What's your favorite way to spend a weekend?",
      "What's a book or movie that changed your perspective?",
      "What's something you're proud of?",
      "What's your favorite thing about yourself?"
    ];

    // Return 5 random icebreakers
    const shuffled = icebreakers.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    res.json({
      success: true,
      icebreakers: selected
    });

  } catch (error) {
    console.error('Error fetching icebreakers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch icebreakers',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/buddies/shared-activity
 * @desc    Create shared activity challenge
 * @access  Private
 */
router.post('/shared-activity', authenticate, async (req, res) => {
  try {
    const { matchId, activityType, title, description, targetCount, duration } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: 'accepted'
    }).populate('user1Id user2Id', 'profile.name');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const buddyId = match.user1Id._id.toString() === req.user._id.toString() 
      ? match.user2Id._id 
      : match.user1Id._id;

    const activity = await SharedActivity.create({
      matchId,
      activityType,
      title,
      description,
      targetCount,
      duration,
      endDate: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : null,
      participants: [
        { userId: req.user._id },
        { userId: buddyId }
      ],
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Shared activity created',
      activity
    });

  } catch (error) {
    console.error('Error creating shared activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shared activity',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/buddies/shared-activities
 * @desc    Get shared activities with buddy
 * @access  Private
 */
router.get('/shared-activities', authenticate, async (req, res) => {
  try {
    const activities = await SharedActivity.find({
      'participants.userId': req.user._id,
      status: 'active'
    })
      .populate('matchId')
      .populate('participants.userId', 'profile.name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Error fetching shared activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared activities',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/buddies/shared-activity/:id/progress
 * @desc    Log progress on shared activity
 * @access  Private
 */
router.post('/shared-activity/:id/progress', authenticate, async (req, res) => {
  try {
    const activity = await SharedActivity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const participant = activity.participants.find(
      p => p.userId.toString() === req.user._id.toString()
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: 'Not a participant'
      });
    }

    participant.progress += 1;
    participant.completedDates.push(new Date());

    if (participant.progress >= activity.targetCount) {
      participant.completed = true;
      participant.completedAt = new Date();
    }

    // Check if all participants completed
    const allCompleted = activity.participants.every(p => p.completed);
    if (allCompleted) {
      activity.status = 'completed';
    }

    await activity.save();

    res.json({
      success: true,
      message: participant.completed ? 'Activity completed! 🎉' : 'Progress logged',
      activity
    });

  } catch (error) {
    console.error('Error logging progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log progress',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/buddies/goal
 * @desc    Create shared goal with buddy
 * @access  Private
 */
router.post('/goal', authenticate, async (req, res) => {
  try {
    const { matchId, title, description, type, targetCount, frequency, endDate } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: 'accepted'
    }).populate('user1Id user2Id');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const buddyId = match.user1Id._id.toString() === req.user._id.toString() 
      ? match.user2Id._id 
      : match.user1Id._id;

    const goal = await BuddyGoal.create({
      matchId,
      title,
      description,
      type,
      targetCount,
      frequency,
      endDate,
      participants: [
        { userId: req.user._id },
        { userId: buddyId }
      ],
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Buddy goal created',
      goal
    });

  } catch (error) {
    console.error('Error creating buddy goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create buddy goal',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/buddies/goals
 * @desc    Get shared goals with buddy
 * @access  Private
 */
router.get('/goals', authenticate, async (req, res) => {
  try {
    const goals = await BuddyGoal.find({
      'participants.userId': req.user._id,
      status: 'active'
    })
      .populate('matchId')
      .populate('participants.userId', 'profile.name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      goals
    });

  } catch (error) {
    console.error('Error fetching buddy goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch buddy goals',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/buddies/sos
 * @desc    Send SOS alert to buddy
 * @access  Private
 */
router.post('/sos', authenticate, async (req, res) => {
  try {
    const { matchId, message } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: 'accepted'
    }).populate('user1Id user2Id', 'profile.name');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const buddyId = match.user1Id._id.toString() === req.user._id.toString() 
      ? match.user2Id._id 
      : match.user1Id._id;

    match.sosAlerts.push({
      from: req.user._id,
      to: buddyId,
      message: message || 'I need support right now'
    });

    await match.save();

    // TODO: Send real-time notification to buddy

    res.json({
      success: true,
      message: 'SOS alert sent to your buddy'
    });

  } catch (error) {
    console.error('Error sending SOS:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send SOS',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/buddies/availability
 * @desc    Update availability status
 * @access  Private
 */
router.patch('/availability', authenticate, async (req, res) => {
  try {
    const { matchId, status, statusMessage } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }],
      status: 'accepted'
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isUser1 = match.user1Id.toString() === req.user._id.toString();
    const availabilityKey = isUser1 ? 'availability.user1' : 'availability.user2';

    match.set(`${availabilityKey}.status`, status);
    match.set(`${availabilityKey}.lastActive`, new Date());
    if (statusMessage !== undefined) {
      match.set(`${availabilityKey}.statusMessage`, statusMessage);
    }

    await match.save();

    res.json({
      success: true,
      message: 'Availability updated'
    });

  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/buddies/rate
 * @desc    Rate buddy after unmatch
 * @access  Private
 */
router.post('/rate', authenticate, async (req, res) => {
  try {
    const { matchId, rating, feedback } = req.body;

    const match = await Match.findOne({
      _id: matchId,
      $or: [{ user1Id: req.user._id }, { user2Id: req.user._id }]
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found'
      });
    }

    const isUser1 = match.user1Id.toString() === req.user._id.toString();

    if (isUser1) {
      match.rating.user1Rating = rating;
      match.rating.user1Feedback = feedback;
    } else {
      match.rating.user2Rating = rating;
      match.rating.user2Feedback = feedback;
    }

    await match.save();

    res.json({
      success: true,
      message: 'Rating submitted. Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Error rating buddy:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate buddy',
      error: error.message
    });
  }
});

export default router;
