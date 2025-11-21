import express from 'express';
import { authenticate } from '../middleware/auth.js';
import WellnessActivity from '../models/WellnessActivity.model.js';
import ActivityProgress from '../models/ActivityProgress.model.js';
import { getRecommendations, getUserWellnessStats } from '../services/wellness.service.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

const router = express.Router();

/**
 * @route   GET /api/wellness/activities
 * @desc    Get all wellness activities with optional filters
 * @access  Private
 */
router.get('/activities', authenticate, async (req, res) => {
  try {
    const { type, difficulty, category, search, limit = 50 } = req.query;
    
    const filter = { isActive: true };
    
    if (type) filter.type = type;
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const activities = await WellnessActivity.find(filter)
      .sort({ popularity: -1 })
      .limit(parseInt(limit));

    // Get user's progress for these activities
    const activityIds = activities.map(a => a._id);
    const userProgress = await ActivityProgress.find({
      userId: req.user._id,
      activityId: { $in: activityIds }
    });

    // Merge progress data with activities
    const activitiesWithProgress = activities.map(activity => {
      const progress = userProgress.find(
        p => p.activityId.toString() === activity._id.toString()
      );
      
      return {
        ...activity.toObject(),
        userProgress: progress ? {
          totalCompletions: progress.totalCompletions,
          totalMinutes: progress.totalMinutes,
          isFavorite: progress.isFavorite,
          lastCompletedAt: progress.lastCompletedAt
        } : null
      };
    });

    res.json({
      success: true,
      activities: activitiesWithProgress,
      total: activities.length
    });

  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activities',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/wellness/activities/:id
 * @desc    Get single activity with user progress
 * @access  Private
 */
router.get('/activities/:id', authenticate, async (req, res) => {
  try {
    const activity = await WellnessActivity.findById(req.params.id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    const progress = await ActivityProgress.findOne({
      userId: req.user._id,
      activityId: activity._id
    });

    res.json({
      success: true,
      activity: {
        ...activity.toObject(),
        userProgress: progress
      }
    });

  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/wellness/activities/:id/complete
 * @desc    Mark activity as completed
 * @access  Private
 */
router.post('/activities/:id/complete', authenticate, async (req, res) => {
  try {
    const { duration, rating, notes } = req.body;
    const activityId = req.params.id;

    // Verify activity exists
    const activity = await WellnessActivity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Find or create progress record
    let progress = await ActivityProgress.findOne({
      userId: req.user._id,
      activityId
    });

    if (!progress) {
      progress = new ActivityProgress({
        userId: req.user._id,
        activityId
      });
    }

    // Add completion
    progress.completions.push({
      completedAt: new Date(),
      duration: duration || activity.duration,
      rating,
      notes
    });

    progress.totalCompletions += 1;
    progress.totalMinutes += duration || activity.duration;
    progress.lastCompletedAt = new Date();
    
    // Calculate streak
    progress.calculateStreak();

    await progress.save();

    // Update activity popularity
    activity.popularity += 1;
    await activity.save();

    res.json({
      success: true,
      message: 'Activity completed!',
      progress: {
        totalCompletions: progress.totalCompletions,
        totalMinutes: progress.totalMinutes,
        currentStreak: progress.currentStreak,
        longestStreak: progress.longestStreak
      }
    });

  } catch (error) {
    console.error('Error completing activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete activity',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/wellness/recommendations
 * @desc    Get AI-powered activity recommendations
 * @access  Private
 */
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const recommendations = await getRecommendations(req.user._id);

    res.json({
      success: true,
      recommendations
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/wellness/favorites/:id
 * @desc    Add activity to favorites
 * @access  Private
 */
router.post('/favorites/:id', authenticate, async (req, res) => {
  try {
    const activityId = req.params.id;

    // Verify activity exists
    const activity = await WellnessActivity.findById(activityId);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      });
    }

    // Find or create progress record
    let progress = await ActivityProgress.findOne({
      userId: req.user._id,
      activityId
    });

    if (!progress) {
      progress = new ActivityProgress({
        userId: req.user._id,
        activityId,
        isFavorite: true
      });
    } else {
      progress.isFavorite = true;
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Added to favorites',
      isFavorite: true
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add to favorites',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/wellness/favorites/:id
 * @desc    Remove activity from favorites
 * @access  Private
 */
router.delete('/favorites/:id', authenticate, async (req, res) => {
  try {
    const progress = await ActivityProgress.findOne({
      userId: req.user._id,
      activityId: req.params.id
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found'
      });
    }

    progress.isFavorite = false;
    await progress.save();

    res.json({
      success: true,
      message: 'Removed from favorites',
      isFavorite: false
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove from favorites',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/wellness/favorites
 * @desc    Get user's favorite activities
 * @access  Private
 */
router.get('/favorites', authenticate, async (req, res) => {
  try {
    const favorites = await ActivityProgress.find({
      userId: req.user._id,
      isFavorite: true
    }).populate('activityId');

    const favoriteActivities = favorites
      .filter(f => f.activityId)
      .map(f => ({
        ...f.activityId.toObject(),
        userProgress: {
          totalCompletions: f.totalCompletions,
          totalMinutes: f.totalMinutes,
          isFavorite: f.isFavorite,
          lastCompletedAt: f.lastCompletedAt
        }
      }));

    res.json({
      success: true,
      favorites: favoriteActivities
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/wellness/progress
 * @desc    Get user's overall wellness progress
 * @access  Private
 */
router.get('/progress', authenticate, async (req, res) => {
  try {
    const stats = await getUserWellnessStats(req.user._id);

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/wellness/upload
 * @desc    Upload audio/video for wellness activity (admin)
 * @access  Private
 */
router.post('/upload', authenticate, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.files.file;
    const { activityId, type } = req.body; // type: 'audio' or 'video'

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.tempFilePath, {
      folder: `mindmate/wellness/${type}`,
      resource_type: type === 'video' ? 'video' : 'auto'
    });

    // Update activity
    if (activityId) {
      const activity = await WellnessActivity.findById(activityId);
      if (activity) {
        if (type === 'audio') {
          activity.audioUrl = result.secure_url;
        } else if (type === 'video') {
          activity.videoUrl = result.secure_url;
        }
        await activity.save();
      }
    }

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

export default router;
