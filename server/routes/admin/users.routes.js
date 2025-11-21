import express from 'express';
import User from '../../models/User.model.js';
import { requirePermission, canActOnTarget, logAdminAction } from '../../middleware/adminAuth.js';
import { canManageRole, getEffectiveRole } from '../../utils/permissions.js';

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters and pagination
 * @access  Private (requires 'view_users' permission)
 */
router.get('/', requirePermission('view_users'), async (req, res) => {
  try {
    const {
      role,
      status,
      search,
      university,
      adminLevel,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (adminLevel) query.adminLevel = adminLevel;
    if (university) query['profile.university'] = { $regex: university, $options: 'i' };
    
    if (search) {
      query.$or = [
        { 'profile.name': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.university': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-firebaseUid -consent')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details by ID
 * @access  Private (requires 'view_users' permission)
 */
router.get('/:id', requirePermission('view_users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-firebaseUid')
      .populate('suspensionDetails.suspendedBy', 'profile.name email')
      .populate('banDetails.bannedBy', 'profile.name email')
      .populate('verifiedBy', 'profile.name email')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/ban
 * @desc    Ban a user
 * @access  Private (requires 'ban_users' permission)
 */
router.post('/:id/ban', requirePermission('ban_users'), canActOnTarget, async (req, res) => {
  try {
    const { reason, permanent = true } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Ban reason must be at least 10 characters'
      });
    }

    const user = req.targetUser; // Attached by canActOnTarget middleware

    // Update user status
    user.status = 'banned';
    user.banDetails = {
      reason: reason.trim(),
      bannedBy: req.user._id,
      bannedAt: new Date(),
      permanent
    };

    await user.save();

    // Log action
    await logAdminAction(req, 'user_banned', 'user', user._id, {
      reason: reason.trim(),
      permanent
    });

    res.json({
      success: true,
      message: 'User banned successfully',
      user: {
        _id: user._id,
        email: user.email,
        status: user.status,
        banDetails: user.banDetails
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to ban user',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/unban
 * @desc    Unban a user
 * @access  Private (requires 'ban_users' permission)
 */
router.post('/:id/unban', requirePermission('ban_users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.status !== 'banned') {
      return res.status(400).json({
        success: false,
        error: 'User is not banned'
      });
    }

    // Update user status
    user.status = 'active';
    user.banDetails = undefined;

    await user.save();

    // Log action
    await logAdminAction(req, 'user_unbanned', 'user', user._id, {
      notes: req.body.notes || 'Ban removed'
    });

    res.json({
      success: true,
      message: 'User unbanned successfully',
      user: {
        _id: user._id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unban user',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/suspend
 * @desc    Suspend a user temporarily
 * @access  Private (requires 'suspend_users' permission)
 */
router.post('/:id/suspend', requirePermission('suspend_users'), canActOnTarget, async (req, res) => {
  try {
    const { reason, duration = 7 } = req.body; // duration in days

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Suspension reason must be at least 10 characters'
      });
    }

    if (duration < 1 || duration > 365) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 1 and 365 days'
      });
    }

    const user = req.targetUser;

    // Calculate suspension end date
    const suspendedUntil = new Date();
    suspendedUntil.setDate(suspendedUntil.getDate() + parseInt(duration));

    // Update user status
    user.status = 'suspended';
    user.suspensionDetails = {
      reason: reason.trim(),
      suspendedBy: req.user._id,
      suspendedAt: new Date(),
      suspendedUntil
    };

    await user.save();

    // Log action
    await logAdminAction(req, 'user_suspended', 'user', user._id, {
      reason: reason.trim(),
      duration: parseInt(duration)
    });

    res.json({
      success: true,
      message: `User suspended for ${duration} days`,
      user: {
        _id: user._id,
        email: user.email,
        status: user.status,
        suspensionDetails: user.suspensionDetails
      }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suspend user',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/unsuspend
 * @desc    Unsuspend a user
 * @access  Private (requires 'suspend_users' permission)
 */
router.post('/:id/unsuspend', requirePermission('suspend_users'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.status !== 'suspended') {
      return res.status(400).json({
        success: false,
        error: 'User is not suspended'
      });
    }

    // Update user status
    user.status = 'active';
    user.suspensionDetails = undefined;

    await user.save();

    // Log action
    await logAdminAction(req, 'user_unsuspended', 'user', user._id, {
      notes: req.body.notes || 'Suspension removed'
    });

    res.json({
      success: true,
      message: 'User unsuspended successfully',
      user: {
        _id: user._id,
        email: user.email,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Unsuspend user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsuspend user',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/warn
 * @desc    Issue a warning to a user
 * @access  Private (requires 'warn_users' permission)
 */
router.post('/:id/warn', requirePermission('warn_users'), canActOnTarget, async (req, res) => {
  try {
    const { reason, message } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Warning reason must be at least 10 characters'
      });
    }

    const user = req.targetUser;

    // Log warning action
    await logAdminAction(req, 'user_warned', 'user', user._id, {
      reason: reason.trim(),
      message: message || 'Official warning issued'
    });

    // TODO: Send notification to user about warning
    // This would integrate with your notification system

    res.json({
      success: true,
      message: 'Warning issued successfully',
      user: {
        _id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Warn user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to issue warning',
      message: error.message
    });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account
 * @access  Private (requires 'delete_users' permission)
 */
router.delete('/:id', requirePermission('delete_users'), canActOnTarget, async (req, res) => {
  try {
    const { reason, confirmEmail } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Deletion reason must be at least 10 characters'
      });
    }

    const user = req.targetUser;

    // Require email confirmation for safety
    if (confirmEmail !== user.email) {
      return res.status(400).json({
        success: false,
        error: 'Email confirmation does not match'
      });
    }

    // Log action before deletion
    await logAdminAction(req, 'user_deleted', 'user', user._id, {
      reason: reason.trim(),
      email: user.email,
      name: user.profile.name
    });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        _id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

/**
 * @route   PATCH /api/admin/users/:id/permissions
 * @desc    Update user permissions
 * @access  Private (requires 'edit_permissions' permission)
 */
router.patch('/:id/permissions', requirePermission('edit_permissions'), async (req, res) => {
  try {
    const { userPermissions } = req.body;

    if (!userPermissions || typeof userPermissions !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Valid userPermissions object required'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Store old permissions for audit log
    const oldPermissions = { ...user.userPermissions };

    // Update permissions
    user.userPermissions = {
      ...user.userPermissions,
      ...userPermissions
    };

    await user.save();

    // Log action
    await logAdminAction(req, 'permissions_updated', 'user', user._id, {
      previousValue: oldPermissions,
      newValue: user.userPermissions
    });

    res.json({
      success: true,
      message: 'User permissions updated successfully',
      user: {
        _id: user._id,
        email: user.email,
        userPermissions: user.userPermissions
      }
    });
  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update permissions',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/assign-role
 * @desc    Assign admin role to user
 * @access  Private (requires 'create_moderators' or higher permission)
 */
router.post('/:id/assign-role', async (req, res) => {
  try {
    const { role, adminLevel, permissions } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        error: 'Role is required'
      });
    }

    // Check if admin can assign this role
    if (!canManageRole(req.user, adminLevel || role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot assign role of equal or higher level',
        targetRole: adminLevel || role,
        yourRole: getEffectiveRole(req.user)
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Store old role for audit
    const oldRole = {
      role: user.role,
      adminLevel: user.adminLevel,
      permissions: user.permissions
    };

    // Update role
    user.role = role;
    if (adminLevel) user.adminLevel = adminLevel;
    if (permissions) user.permissions = permissions;

    await user.save();

    // Log action
    await logAdminAction(req, 'role_assigned', 'user', user._id, {
      previousValue: oldRole,
      newValue: { role, adminLevel, permissions }
    });

    res.json({
      success: true,
      message: 'Role assigned successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        adminLevel: user.adminLevel,
        permissions: user.permissions
      }
    });
  } catch (error) {
    console.error('Assign role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to assign role',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/users/:id/revoke-role
 * @desc    Revoke admin role from user
 * @access  Private (requires 'revoke_roles' permission)
 */
router.post('/:id/revoke-role', requirePermission('revoke_roles'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if can revoke this user's role
    if (!canManageRole(req.user, user.adminLevel || user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Cannot revoke role of equal or higher level'
      });
    }

    // Store old role for audit
    const oldRole = {
      role: user.role,
      adminLevel: user.adminLevel,
      permissions: user.permissions
    };

    // Revoke admin role - set back to student
    user.role = 'student';
    user.adminLevel = null;
    user.permissions = [];

    await user.save();

    // Log action
    await logAdminAction(req, 'role_removed', 'user', user._id, {
      previousValue: oldRole,
      newValue: { role: 'student', adminLevel: null, permissions: [] },
      notes: req.body.reason || 'Role revoked'
    });

    res.json({
      success: true,
      message: 'Admin role revoked successfully',
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        adminLevel: user.adminLevel
      }
    });
  } catch (error) {
    console.error('Revoke role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke role',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/users/stats/overview
 * @desc    Get user statistics overview
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/stats/overview', requirePermission('view_analytics'), async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      suspendedUsers,
      bannedUsers,
      studentCount,
      teacherCount,
      therapistCount,
      adminCount
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'suspended' }),
      User.countDocuments({ status: 'banned' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      User.countDocuments({ role: 'therapist' }),
      User.countDocuments({ adminLevel: { $ne: null } })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalUsers,
        byStatus: {
          active: activeUsers,
          suspended: suspendedUsers,
          banned: bannedUsers
        },
        byRole: {
          students: studentCount,
          teachers: teacherCount,
          therapists: therapistCount,
          admins: adminCount
        }
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
      message: error.message
    });
  }
});

export default router;
