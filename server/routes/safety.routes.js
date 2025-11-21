import express from 'express';
import { authenticate } from '../middleware/auth.js';
import SafetyPlan, { DEFAULT_HOTLINES } from '../models/SafetyPlan.model.js';
import CrisisLog from '../models/CrisisLog.model.js';
import { 
  detectCrisis, 
  completeFollowUp, 
  getUserCrisisHistory,
  getCrisisStats 
} from '../services/crisisDetection.service.js';

const router = express.Router();

/**
 * @route   POST /api/safety/plan
 * @desc    Create or update safety plan
 * @access  Private
 */
router.post('/plan', authenticate, async (req, res) => {
  try {
    const {
      warningSignals,
      copingStrategies,
      distractions,
      socialSupport,
      professionalContacts,
      emergencyContacts,
      safeEnvironment,
      reasonsToLive
    } = req.body;

    let safetyPlan = await SafetyPlan.findOne({ userId: req.user._id });

    if (safetyPlan) {
      // Update existing plan
      Object.assign(safetyPlan, {
        warningSignals,
        copingStrategies,
        distractions,
        socialSupport,
        professionalContacts,
        emergencyContacts,
        safeEnvironment,
        reasonsToLive
      });
    } else {
      // Create new plan
      safetyPlan = new SafetyPlan({
        userId: req.user._id,
        warningSignals,
        copingStrategies,
        distractions,
        socialSupport,
        professionalContacts,
        emergencyContacts,
        safeEnvironment,
        reasonsToLive,
        crisisHotlines: DEFAULT_HOTLINES
      });
    }

    await safetyPlan.save();

    res.json({
      success: true,
      message: 'Safety plan saved successfully',
      safetyPlan
    });

  } catch (error) {
    console.error('Error saving safety plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save safety plan',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/safety/plan
 * @desc    Get user's safety plan
 * @access  Private
 */
router.get('/plan', authenticate, async (req, res) => {
  try {
    let safetyPlan = await SafetyPlan.findOne({ userId: req.user._id });

    if (!safetyPlan) {
      // Return empty plan with default hotlines
      safetyPlan = {
        crisisHotlines: DEFAULT_HOTLINES,
        warningSignals: [],
        copingStrategies: [],
        distractions: [],
        socialSupport: [],
        professionalContacts: [],
        emergencyContacts: [],
        safeEnvironment: [],
        reasonsToLive: []
      };
    }

    res.json({
      success: true,
      safetyPlan
    });

  } catch (error) {
    console.error('Error fetching safety plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch safety plan',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/safety/detect
 * @desc    Detect crisis in text
 * @access  Private
 */
router.post('/detect', authenticate, async (req, res) => {
  try {
    const { text, source = 'manual' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const detection = await detectCrisis(text, req.user._id, source);

    res.json({
      success: true,
      detection
    });

  } catch (error) {
    console.error('Error detecting crisis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to detect crisis',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/safety/crisis/:id/respond
 * @desc    User responds to crisis intervention
 * @access  Private
 */
router.post('/crisis/:id/respond', authenticate, async (req, res) => {
  try {
    const { response } = req.body; // 'acknowledged', 'dismissed', 'contacted_help'

    const crisisLog = await CrisisLog.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!crisisLog) {
      return res.status(404).json({
        success: false,
        message: 'Crisis log not found'
      });
    }

    crisisLog.userResponse = response;
    
    if (response === 'contacted_help') {
      crisisLog.resolved = true;
      crisisLog.resolvedAt = new Date();
    }

    await crisisLog.save();

    res.json({
      success: true,
      message: 'Response recorded',
      crisisLog
    });

  } catch (error) {
    console.error('Error recording response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record response',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/safety/follow-up/:id
 * @desc    Complete follow-up check-in
 * @access  Private
 */
router.post('/follow-up/:id', authenticate, async (req, res) => {
  try {
    const { mood, feeling, needsHelp, notes } = req.body;

    const response = {
      mood,
      feeling,
      needsHelp,
      notes
    };

    const crisisLog = await completeFollowUp(req.params.id, response);

    res.json({
      success: true,
      message: 'Follow-up completed',
      crisisLog
    });

  } catch (error) {
    console.error('Error completing follow-up:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete follow-up',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/safety/history
 * @desc    Get user's crisis history
 * @access  Private
 */
router.get('/history', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await getUserCrisisHistory(req.user._id, limit);

    res.json({
      success: true,
      history
    });

  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/safety/stats
 * @desc    Get crisis statistics
 * @access  Private
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const stats = await getCrisisStats(req.user._id);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/safety/resources
 * @desc    Get crisis resources (hotlines, etc.)
 * @access  Public
 */
router.get('/resources', async (req, res) => {
  try {
    res.json({
      success: true,
      resources: {
        hotlines: DEFAULT_HOTLINES,
        emergencyNumber: '911',
        textLine: {
          number: '741741',
          message: 'Text HOME to 741741'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resources',
      error: error.message
    });
  }
});

export default router;
