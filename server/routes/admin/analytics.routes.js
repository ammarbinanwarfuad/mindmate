import express from 'express';
import { requirePermission, logAdminAction } from '../../middleware/adminAuth.js';
import User from '../../models/User.model.js';
import AdminAction from '../../models/AdminAction.model.js';

const router = express.Router();

/**
 * @route   GET /api/admin/analytics/overview
 * @desc    Get platform overview statistics
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/overview', requirePermission('view_analytics'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // User statistics
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: lastWeek } }),
      User.countDocuments({ createdAt: { $gte: lastMonth } })
    ]);

    // Admin actions today
    const adminActionsToday = await AdminAction.countDocuments({
      timestamp: { $gte: today }
    });

    res.json({
      success: true,
      overview: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth
        },
        adminActions: {
          today: adminActionsToday
        }
      }
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch overview statistics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/analytics/users
 * @desc    Get detailed user analytics
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/users', requirePermission('view_analytics'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    }

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Users by status
    const usersByStatus = await User.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Users by university (top 10)
    const usersByUniversity = await User.aggregate([
      {
        $match: {
          'profile.university': { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$profile.university',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      analytics: {
        growth: userGrowth,
        byRole: usersByRole,
        byStatus: usersByStatus,
        byUniversity: usersByUniversity
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/analytics/engagement
 * @desc    Get engagement metrics
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/engagement', requirePermission('view_analytics'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Active users over time
    const activeUsers = await User.aggregate([
      {
        $match: {
          lastActive: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$lastActive' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      engagement: {
        activeUsers
      }
    });
  } catch (error) {
    console.error('Get engagement error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagement metrics',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/analytics/admin-actions
 * @desc    Get admin action analytics
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/admin-actions', requirePermission('view_analytics'), async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    const startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    }

    // Actions by type
    const actionsByType = await AdminAction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Actions by admin
    const actionsByAdmin = await AdminAction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$adminId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'admin'
        }
      },
      {
        $unwind: '$admin'
      },
      {
        $project: {
          adminName: '$admin.profile.name',
          adminEmail: '$admin.email',
          count: 1
        }
      }
    ]);

    // Actions over time
    const actionsOverTime = await AdminAction.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        byType: actionsByType,
        byAdmin: actionsByAdmin,
        overTime: actionsOverTime
      }
    });
  } catch (error) {
    console.error('Get admin actions analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch admin action analytics',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/analytics/export
 * @desc    Export analytics data
 * @access  Private (requires 'export_data' permission)
 */
router.post('/export', requirePermission('export_data'), async (req, res) => {
  try {
    const { type, format = 'json', filters = {} } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Export type is required (users, actions, etc.)'
      });
    }

    let data = [];

    switch (type) {
      case 'users':
        data = await User.find(filters)
          .select('-firebaseUid -consent')
          .lean();
        break;
      
      case 'admin-actions':
        data = await AdminAction.find(filters)
          .populate('adminId', 'profile.name email')
          .lean();
        break;
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type'
        });
    }

    // Log export action
    await logAdminAction(req, 'data_exported', 'system', null, {
      type,
      format,
      recordCount: data.length
    });

    // Return data (in production, you might want to generate CSV or send email)
    res.json({
      success: true,
      message: 'Data exported successfully',
      data,
      meta: {
        type,
        format,
        recordCount: data.length,
        exportedAt: new Date(),
        exportedBy: req.user.email
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/analytics/audit-log
 * @desc    Get audit log with filters
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/audit-log', requirePermission('view_analytics'), async (req, res) => {
  try {
    const {
      adminId,
      action,
      targetType,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    // Build query
    const query = {};
    
    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (targetType) query.targetType = targetType;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [actions, total] = await Promise.all([
      AdminAction.find(query)
        .populate('adminId', 'profile.name email role')
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      AdminAction.countDocuments(query)
    ]);

    res.json({
      success: true,
      actions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch audit log',
      message: error.message
    });
  }
});

export default router;
