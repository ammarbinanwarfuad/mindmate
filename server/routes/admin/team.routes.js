import express from 'express';
import User from '../../models/User.model.js';
import { requirePermission, logAdminAction } from '../../middleware/adminAuth.js';
import { isAdminRole, ROLE_PERMISSIONS, getPermissionDescription } from '../../utils/permissions.js';

const router = express.Router();

/**
 * @route   GET /api/admin/team
 * @desc    Get all team members (admins, moderators, advisors, helpers)
 * @access  Private (requires 'view_users' permission)
 */
router.get('/', requirePermission('view_users'), async (req, res) => {
  try {
    const {
      role,
      adminLevel,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query for team members only
    const query = {
      $or: [
        { adminLevel: { $ne: null } },
        { role: { $in: ['helper', 'advisor', 'moderator', 'admin', 'super_admin'] } }
      ]
    };
    
    if (role) query.role = role;
    if (adminLevel) query.adminLevel = adminLevel;
    
    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { 'profile.name': { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [teamMembers, total] = await Promise.all([
      User.find(query)
        .select('email profile.name role adminLevel permissions status lastActive createdAt')
        .sort(sortOptions)
        .limit(parseInt(limit))
        .skip(skip)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      teamMembers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team members',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/team/:id
 * @desc    Get team member details
 * @access  Private (requires 'view_users' permission)
 */
router.get('/:id', requirePermission('view_users'), async (req, res) => {
  try {
    const teamMember = await User.findById(req.params.id)
      .select('-firebaseUid -consent')
      .lean();

    if (!teamMember) {
      return res.status(404).json({
        success: false,
        error: 'Team member not found'
      });
    }

    // Check if user is actually a team member
    if (!isAdminRole(teamMember.role) && !teamMember.adminLevel) {
      return res.status(400).json({
        success: false,
        error: 'User is not a team member'
      });
    }

    res.json({
      success: true,
      teamMember
    });
  } catch (error) {
    console.error('Get team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team member',
      message: error.message
    });
  }
});

/**
 * @route   POST /api/admin/team/invite
 * @desc    Invite a new admin/moderator/advisor/helper
 * @access  Private (requires 'create_moderators' or higher permission)
 */
router.post('/invite', requirePermission('create_moderators'), async (req, res) => {
  try {
    const { email, role, adminLevel, permissions } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email and role are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create invitation data
    const invitationData = {
      email,
      role,
      adminLevel: adminLevel || role,
      permissions: permissions || [],
      invitedBy: req.user._id,
      invitedAt: new Date(),
      status: 'pending'
    };

    // Log action
    await logAdminAction(req, 'role_assigned', 'user', null, {
      email,
      role,
      adminLevel,
      permissions,
      action: 'invitation_sent'
    });

    // TODO: Send invitation email
    // TODO: Create invitation token
    // TODO: Store invitation in database

    res.status(201).json({
      success: true,
      message: 'Invitation sent successfully',
      invitation: invitationData
    });
  } catch (error) {
    console.error('Invite team member error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitation',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/team/permissions
 * @desc    Get all available permissions with descriptions
 * @access  Private (requires 'view_users' permission)
 */
router.get('/permissions/list', requirePermission('view_users'), async (req, res) => {
  try {
    // Get all permissions from ROLE_PERMISSIONS
    const allPermissions = [
      '*',
      'view_users', 'ban_users', 'delete_users', 'suspend_users', 'warn_users', 'edit_permissions',
      'delete_posts', 'hide_posts', 'delete_comments', 'review_reports',
      'view_crisis', 'handle_crisis', 'contact_emergency',
      'view_analytics', 'export_data', 'view_user_analytics',
      'create_challenges', 'edit_challenges', 'delete_challenges', 'manage_resources', 'create_announcements',
      'create_admins', 'create_moderators', 'create_advisors', 'create_helpers', 'revoke_roles',
      'system_settings', 'database_access', 'api_config'
    ];

    // Create permission list with descriptions
    const permissions = allPermissions.map(permission => ({
      name: permission,
      description: getPermissionDescription(permission),
      category: getCategoryForPermission(permission)
    }));

    res.json({
      success: true,
      permissions,
      rolePermissions: ROLE_PERMISSIONS
    });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch permissions',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/admin/team/stats
 * @desc    Get team statistics
 * @access  Private (requires 'view_analytics' permission)
 */
router.get('/stats/overview', requirePermission('view_analytics'), async (req, res) => {
  try {
    const [
      totalTeamMembers,
      superAdmins,
      admins,
      moderators,
      advisors,
      helpers,
      activeToday
    ] = await Promise.all([
      User.countDocuments({
        $or: [
          { adminLevel: { $ne: null } },
          { role: { $in: ['helper', 'advisor', 'moderator', 'admin', 'super_admin'] } }
        ]
      }),
      User.countDocuments({ adminLevel: 'super_admin' }),
      User.countDocuments({ adminLevel: 'admin' }),
      User.countDocuments({ adminLevel: 'moderator' }),
      User.countDocuments({ adminLevel: 'advisor' }),
      User.countDocuments({ adminLevel: 'helper' }),
      User.countDocuments({
        $or: [
          { adminLevel: { $ne: null } },
          { role: { $in: ['helper', 'advisor', 'moderator', 'admin', 'super_admin'] } }
        ],
        lastActive: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    res.json({
      success: true,
      stats: {
        total: totalTeamMembers,
        byRole: {
          superAdmins,
          admins,
          moderators,
          advisors,
          helpers
        },
        activeToday
      }
    });
  } catch (error) {
    console.error('Get team stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch team statistics',
      message: error.message
    });
  }
});

/**
 * Helper function to categorize permissions
 */
function getCategoryForPermission(permission) {
  if (permission === '*') return 'All';
  if (permission.includes('user')) return 'User Management';
  if (permission.includes('post') || permission.includes('comment') || permission.includes('report')) return 'Content Moderation';
  if (permission.includes('crisis') || permission.includes('emergency')) return 'Crisis Management';
  if (permission.includes('analytics') || permission.includes('export') || permission.includes('data')) return 'Analytics';
  if (permission.includes('challenge') || permission.includes('resource') || permission.includes('announcement')) return 'Content Management';
  if (permission.includes('admin') || permission.includes('moderator') || permission.includes('advisor') || permission.includes('helper') || permission.includes('role')) return 'Admin Management';
  if (permission.includes('system') || permission.includes('database') || permission.includes('api')) return 'System';
  return 'Other';
}

export default router;
