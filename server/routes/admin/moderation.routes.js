import express from 'express';
import { requirePermission, logAdminAction } from '../../middleware/adminAuth.js';

const router = express.Router();

/**
 * @route   GET /api/admin/posts
 * @desc    Get all posts with filters
 * @access  Private (requires 'delete_posts' permission)
 */
router.get('/posts', requirePermission('view_posts'), async (req, res) => {
  try {
    const {
      search,
      userId,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Import models dynamically
    const ForumPost = (await import('../../models/ForumPost.model.js')).default;

    // Build query
    const query = {};
    
    if (userId) {
      query.authorId = userId;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [posts, total] = await Promise.all([
      ForumPost.find(query)
        .populate('authorId', 'profile.name email')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      ForumPost.countDocuments(query)
    ]);

    res.json({
      success: true,
      posts,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/posts/:id
 * @desc    Get post details
 * @access  Private (requires 'delete_posts' permission)
 */
router.get('/posts/:id', requirePermission('delete_posts'), async (req, res) => {
  try {
    const ForumPost = (await import('../../models/ForumPost.model.js')).default;

    const post = await ForumPost.findById(req.params.id)
      .populate('userId', 'profile.name email profile.profilePicture')
      .populate('comments.userId', 'profile.name email')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    res.json({
      success: true,
      post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/posts/:id
 * @desc    Delete a post
 * @access  Private (requires 'delete_posts' permission)
 */
router.delete('/posts/:id', requirePermission('delete_posts'), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Deletion reason must be at least 10 characters'
      });
    }

    const ForumPost = (await import('../../models/ForumPost.model.js')).default;

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Log action before deletion
    await logAdminAction(req, 'post.delete', 'post', post._id, {
      reason: reason.trim(),
      title: post.title,
      authorId: post.authorId
    });

    // Delete post
    await ForumPost.findByIdAndDelete(post._id);

    res.json({
      success: true,
      message: 'Post deleted successfully',
      deletedPost: {
        _id: post._id,
        title: post.title
      }
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/posts/:id/hide
 * @desc    Hide/unhide a post
 * @access  Private (requires 'hide_posts' permission)
 */
router.patch('/posts/:id/hide', requirePermission('hide_posts'), async (req, res) => {
  try {
    const { hidden, reason } = req.body;

    if (hidden && (!reason || reason.trim().length < 10)) {
      return res.status(400).json({
        success: false,
        error: 'Reason must be at least 10 characters when hiding post'
      });
    }

    const ForumPost = (await import('../../models/ForumPost.model.js')).default;

    const post = await ForumPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Update post visibility
    post.hidden = hidden;
    if (hidden) {
      post.hiddenReason = reason.trim();
      post.hiddenBy = req.user._id;
      post.hiddenAt = new Date();
    } else {
      post.hiddenReason = undefined;
      post.hiddenBy = undefined;
      post.hiddenAt = undefined;
    }

    await post.save();

    // Log action
    await logAdminAction(
      req,
      hidden ? 'post.hide' : 'post.restore',
      'post',
      post._id,
      { 
        reason: reason?.trim() || 'Post restored',
        title: post.title,
        authorId: post.authorId
      }
    );

    res.json({
      success: true,
      message: hidden ? 'Post hidden successfully' : 'Post restored successfully',
      post: {
        _id: post._id,
        title: post.title,
        hidden: post.hidden
      }
    });
  } catch (error) {
    console.error('Hide post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post visibility',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/comments/:id
 * @desc    Delete a comment
 * @access  Private (requires 'delete_comments' permission)
 */
router.delete('/comments/:id', requirePermission('delete_comments'), async (req, res) => {
  try {
    const { postId, reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Deletion reason must be at least 10 characters'
      });
    }

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required'
      });
    }

    const ForumPost = (await import('../../models/ForumPost.model.js')).default;

    const post = await ForumPost.findById(postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Find and remove comment
    const commentIndex = post.comments.findIndex(
      c => c._id.toString() === req.params.id
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const comment = post.comments[commentIndex];

    // Log action before deletion
    await logAdminAction(req, 'comment_deleted', 'comment', comment._id, {
      reason: reason.trim(),
      postId: post._id,
      userId: comment.userId
    });

    // Remove comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      deletedComment: {
        _id: comment._id
      }
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete comment',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/reports
 * @desc    Get all user reports
 * @access  Private (requires 'review_reports' permission)
 */
router.get('/reports', requirePermission('review_reports'), async (req, res) => {
  try {
    const {
      status = 'pending',
      type,
      page = 1,
      limit = 20
    } = req.query;

    // Build query (assuming you have a Report model)
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    // Mock response - replace with actual Report model query
    const reports = [];
    const total = 0;

    res.json({
      success: true,
      reports,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/reports/:id/resolve
 * @desc    Resolve a report
 * @access  Private (requires 'review_reports' permission)
 */
router.patch('/reports/:id/resolve', requirePermission('review_reports'), async (req, res) => {
  try {
    const { action, notes } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required (approved, dismissed, escalated)'
      });
    }

    // Log action
    await logAdminAction(req, 'report_resolved', 'report', req.params.id, {
      action,
      notes: notes || 'Report resolved'
    });

    res.json({
      success: true,
      message: 'Report resolved successfully',
      report: {
        _id: req.params.id,
        status: 'resolved',
        action
      }
    });
  } catch (error) {
    console.error('Resolve report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve report',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/moderation/stats
 * @desc    Get moderation statistics
 * @access  Private (requires 'delete_posts' permission)
 */
router.get('/stats', requirePermission('delete_posts'), async (req, res) => {
  try {
    const ForumPost = (await import('../../models/ForumPost.model.js')).default;

    const [
      totalPosts,
      hiddenPosts,
      flaggedPosts,
      postsToday
    ] = await Promise.all([
      ForumPost.countDocuments(),
      ForumPost.countDocuments({ hidden: true }),
      ForumPost.countDocuments({ flagged: true }),
      ForumPost.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    res.json({
      success: true,
      stats: {
        totalPosts,
        hiddenPosts,
        flaggedPosts,
        postsToday,
        pendingReports: 0 // Replace with actual report count
      }
    });
  } catch (error) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation statistics',
      message: error.message
    });
  }
});

export default router;
