import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Goal from '../models/Goal.model.js';
import HabitLog from '../models/HabitLog.model.js';
import Milestone from '../models/Milestone.model.js';
import { getGoalSuggestions, checkMilestones, getGoalStats } from '../services/goals.service.js';

const router = express.Router();

/**
 * @route   POST /api/goals
 * @desc    Create a new goal
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      frequency,
      target,
      endDate,
      reminderEnabled,
      reminderTime,
      reminderDays,
      icon,
      color
    } = req.body;

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description,
      type,
      frequency,
      target,
      endDate,
      reminderEnabled,
      reminderTime,
      reminderDays,
      icon,
      color
    });

    res.status(201).json({
      success: true,
      message: 'Goal created successfully',
      goal
    });

  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/goals
 * @desc    Get all user's goals
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, type } = req.query;
    
    const filter = { userId: req.user._id };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });

    // Add streak and progress info
    const goalsWithStats = goals.map(goal => ({
      ...goal.toObject(),
      streak: goal.calculateStreak(),
      progressPercentage: goal.progressPercentage
    }));

    res.json({
      success: true,
      goals: goalsWithStats
    });

  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/goals/:id
 * @desc    Get single goal with detailed stats
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Get habit logs for this goal
    const logs = await HabitLog.find({ goalId: goal._id })
      .sort({ completedAt: -1 })
      .limit(30);

    const goalWithStats = {
      ...goal.toObject(),
      streak: goal.calculateStreak(),
      progressPercentage: goal.progressPercentage,
      recentLogs: logs
    };

    res.json({
      success: true,
      goal: goalWithStats
    });

  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal',
      error: error.message
    });
  }
});

/**
 * @route   PATCH /api/goals/:id
 * @desc    Update a goal
 * @access  Private
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'target', 'endDate', 'status',
      'reminderEnabled', 'reminderTime', 'reminderDays', 'notes', 'icon', 'color'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        goal[field] = req.body[field];
      }
    });

    await goal.save();

    res.json({
      success: true,
      message: 'Goal updated successfully',
      goal
    });

  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/goals/:id
 * @desc    Delete a goal
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Delete associated habit logs
    await HabitLog.deleteMany({ goalId: goal._id });

    res.json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/goals/:id/log
 * @desc    Log a habit completion
 * @access  Private
 */
router.post('/:id/log', authenticate, async (req, res) => {
  try {
    const { value = 1, notes, mood } = req.body;

    const goal = await Goal.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Create habit log
    const log = await HabitLog.create({
      userId: req.user._id,
      goalId: goal._id,
      value,
      notes,
      mood
    });

    // Update goal progress
    goal.currentProgress += value;
    goal.completedDates.push(new Date());
    
    // Check if goal is completed
    const isCompleted = goal.checkCompletion();
    
    await goal.save();

    // Check for new milestones
    const newMilestones = await checkMilestones(req.user._id);

    res.json({
      success: true,
      message: isCompleted ? 'Goal completed! 🎉' : 'Progress logged!',
      goal: {
        ...goal.toObject(),
        streak: goal.calculateStreak(),
        progressPercentage: goal.progressPercentage
      },
      log,
      isCompleted,
      newMilestones
    });

  } catch (error) {
    console.error('Error logging habit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log habit',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/goals/suggestions/ai
 * @desc    Get AI-powered goal suggestions
 * @access  Private
 */
router.get('/suggestions/ai', authenticate, async (req, res) => {
  try {
    const suggestions = await getGoalSuggestions(req.user._id);

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/goals/milestones/earned
 * @desc    Get user's earned milestones
 * @access  Private
 */
router.get('/milestones/earned', authenticate, async (req, res) => {
  try {
    const milestones = await Milestone.find({ userId: req.user._id })
      .sort({ unlockedAt: -1 })
      .populate('relatedGoalId', 'title');

    res.json({
      success: true,
      milestones
    });

  } catch (error) {
    console.error('Error fetching milestones:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch milestones',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/goals/stats/overview
 * @desc    Get user's goal statistics
 * @access  Private
 */
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const stats = await getGoalStats(req.user._id);

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

export default router;
