import express from 'express';
import { requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/content/challenges
 * @desc    Get all challenges (admin view)
 * @access  Private (requires 'manage_resources' permission)
 */
router.get('/challenges', requirePermission('manage_resources'), async (req, res) => {
  try {
    const {
      status,
      type,
      category,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const WellnessChallenge = (await import('../../models/WellnessChallenge.model.js')).default;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [challenges, total] = await Promise.all([
      WellnessChallenge.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      WellnessChallenge.countDocuments(query)
    ]);

    res.json({
      success: true,
      challenges,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch challenges',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/content/challenges
 * @desc    Create a new challenge
 * @access  Private (requires 'create_challenges' permission)
 */
router.post('/challenges', requirePermission('create_challenges'), async (req, res) => {
  try {
    const challengeData = req.body;

    if (!challengeData.title || !challengeData.description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    const WellnessChallenge = (await import('../../models/WellnessChallenge.model.js')).default;

    // Create challenge
    const challenge = await WellnessChallenge.create({
      ...challengeData,
      createdBy: req.user._id
    });

    // Log action
    await logAdminAction(req, 'challenge_created', 'challenge', challenge._id, {
      title: challenge.title,
      type: challenge.type,
      category: challenge.category
    });

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create challenge',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/content/challenges/:id
 * @desc    Update a challenge
 * @access  Private (requires 'edit_challenges' permission)
 */
router.patch('/challenges/:id', requirePermission('edit_challenges'), async (req, res) => {
  try {
    const updates = req.body;

    const WellnessChallenge = (await import('../../models/WellnessChallenge.model.js')).default;

    const challenge = await WellnessChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Store old values for audit
    const oldValues = {
      title: challenge.title,
      status: challenge.status,
      type: challenge.type
    };

    // Update challenge
    Object.assign(challenge, updates);
    await challenge.save();

    // Log action
    await logAdminAction(req, 'challenge_updated', 'challenge', challenge._id, {
      previousValue: oldValues,
      newValue: updates
    });

    res.json({
      success: true,
      message: 'Challenge updated successfully',
      challenge
    });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update challenge',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/content/challenges/:id
 * @desc    Delete a challenge
 * @access  Private (requires 'delete_challenges' permission)
 */
router.delete('/challenges/:id', requirePermission('delete_challenges'), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Deletion reason must be at least 10 characters'
      });
    }

    const WellnessChallenge = (await import('../../models/WellnessChallenge.model.js')).default;

    const challenge = await WellnessChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        error: 'Challenge not found'
      });
    }

    // Log action before deletion
    await logAdminAction(req, 'challenge_deleted', 'challenge', challenge._id, {
      reason: reason.trim(),
      title: challenge.title,
      participantCount: challenge.participants?.length || 0
    });

    // Delete challenge
    await WellnessChallenge.findByIdAndDelete(challenge._id);

    res.json({
      success: true,
      message: 'Challenge deleted successfully',
      deletedChallenge: {
        _id: challenge._id,
        title: challenge.title
      }
    });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete challenge',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/content/resources
 * @desc    Get all wellness resources
 * @access  Private (requires 'manage_resources' permission)
 */
router.get('/resources', requirePermission('manage_resources'), async (req, res) => {
  try {
    const {
      type,
      category,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query for resources (assuming you have a Resource model)
    const query = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Mock response - replace with actual Resource model query
    const resources = [];
    const total = 0;

    res.json({
      success: true,
      resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch resources',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/content/resources
 * @desc    Add a new wellness resource
 * @access  Private (requires 'manage_resources' permission)
 */
router.post('/resources', requirePermission('manage_resources'), async (req, res) => {
  try {
    const { title, description, type, category, url, content } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and type are required'
      });
    }

    // Create resource (assuming you have a Resource model)
    const resourceData = {
      title,
      description,
      type,
      category,
      url,
      content,
      createdBy: req.user._id,
      createdAt: new Date()
    };

    // Log action
    await logAdminAction(req, 'resource_added', 'resource', null, {
      title,
      type,
      category
    });

    res.status(201).json({
      success: true,
      message: 'Resource added successfully',
      resource: resourceData
    });
  } catch (error) {
    console.error('Add resource error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add resource',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/content/announcements
 * @desc    Create a platform announcement
 * @access  Private (requires 'create_announcements' permission)
 */
router.post('/announcements', requirePermission('create_announcements'), async (req, res) => {
  try {
    const { title, message, type, targetAudience, expiresAt } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Title and message are required'
      });
    }

    // Create announcement (assuming you have an Announcement model)
    const announcementData = {
      title,
      message,
      type: type || 'info',
      targetAudience: targetAudience || 'all',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: req.user._id,
      createdAt: new Date(),
      active: true
    };

    // Log action
    await logAdminAction(req, 'announcement_created', 'announcement', null, {
      title,
      type,
      targetAudience
    });

    // TODO: Send notification to users based on targetAudience

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      announcement: announcementData
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create announcement',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/content/stats
 * @desc    Get content statistics
 * @access  Private (requires 'manage_resources' permission)
 */
router.get('/stats', requirePermission('manage_resources'), async (req, res) => {
  try {
    const WellnessChallenge = (await import('../../models/WellnessChallenge.model.js')).default;

    const [
      totalChallenges,
      activeChallenges,
      completedChallenges,
      totalParticipants
    ] = await Promise.all([
      WellnessChallenge.countDocuments(),
      WellnessChallenge.countDocuments({ status: 'active' }),
      WellnessChallenge.countDocuments({ status: 'completed' }),
      WellnessChallenge.aggregate([
        { $unwind: '$participants' },
        { $group: { _id: null, count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        challenges: {
          total: totalChallenges,
          active: activeChallenges,
          completed: completedChallenges
        },
        participants: totalParticipants[0]?.count || 0,
        resources: 0, // TODO: Add when Resource model exists
        announcements: 0 // TODO: Add when Announcement model exists
      }
    });
  } catch (error) {
    console.error('Get content stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content statistics',
      message: error.message
    });
  }
});

export default router;
