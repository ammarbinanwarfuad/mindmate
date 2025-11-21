import { hasPermission, canActOnUser, canAccessAdminPanel, getEffectiveRole } from '../utils/permissions.js';
import AdminAction from '../models/AdminAction.model.js';

/**
 * Middleware to require specific permission
 * @param {String} permission - Required permission
 * @returns {Function} Express middleware
 */
export const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }
      
      if (!hasPermission(req.user, permission)) {
        return res.status(403).json({ 
          success: false,
          error: `Permission '${permission}' required`,
          required: permission,
          userRole: getEffectiveRole(req.user)
        });
      }
      
      next();
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Permission check failed' 
      });
    }
  };
};

/**
 * Middleware to require specific role(s)
 * @param {String|Array} roles - Required role(s)
 * @returns {Function} Express middleware
 */
export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          error: 'Authentication required' 
        });
      }
      
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const userRole = getEffectiveRole(req.user);
      
      if (!allowedRoles.includes(userRole) && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          success: false,
          error: 'Insufficient role level',
          required: allowedRoles,
          userRole: userRole
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Role check failed' 
      });
    }
  };
};

/**
 * Middleware to require admin access
 * @returns {Function} Express middleware
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }
    
    if (!canAccessAdminPanel(req.user)) {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required',
        userRole: getEffectiveRole(req.user)
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Admin check failed' 
    });
  }
};

/**
 * Middleware to check if user can act on target user
 * Expects req.params.userId or req.body.userId
 * @returns {Function} Express middleware
 */
export const canActOnTarget = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }
    
    const targetUserId = req.params.userId || req.body.userId;
    if (!targetUserId) {
      return res.status(400).json({ 
        success: false,
        error: 'Target user ID required' 
      });
    }
    
    // Get target user
    const User = (await import('../models/User.model.js')).default;
    const targetUser = await User.findById(targetUserId);
    
    if (!targetUser) {
      return res.status(404).json({ 
        success: false,
        error: 'Target user not found' 
      });
    }
    
    // Check if can act on target
    if (!canActOnUser(req.user, targetUser)) {
      return res.status(403).json({ 
        success: false,
        error: 'Cannot perform action on user of equal or higher role',
        targetRole: getEffectiveRole(targetUser),
        yourRole: getEffectiveRole(req.user)
      });
    }
    
    // Attach target user to request for use in route handler
    req.targetUser = targetUser;
    next();
  } catch (error) {
    console.error('Target user check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Target user check failed' 
    });
  }
};

/**
 * Log admin action to audit trail
 * @param {Object} req - Express request object
 * @param {String} action - Action type
 * @param {String} targetType - Target type (user, post, etc.)
 * @param {String} targetId - Target ID
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} Created admin action
 */
export const logAdminAction = async (req, action, targetType, targetId, details = {}) => {
  try {
    if (!req.user) {
      console.warn('Attempted to log admin action without authenticated user');
      return null;
    }
    
    const actionData = {
      adminId: req.user._id,
      action,
      targetType,
      targetId,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };
    
    const adminAction = await AdminAction.logAction(actionData);
    return adminAction;
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw - logging shouldn't break the main operation
    return null;
  }
};

/**
 * Middleware to automatically log action after successful response
 * Usage: router.post('/ban', requirePermission('ban_users'), autoLogAction('user_banned', 'user'), handler)
 * @param {String} action - Action type
 * @param {String} targetType - Target type
 * @param {Function} getTargetId - Function to extract target ID from req (optional)
 * @param {Function} getDetails - Function to extract details from req (optional)
 * @returns {Function} Express middleware
 */
export const autoLogAction = (action, targetType, getTargetId = null, getDetails = null) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to log after successful response
    res.json = function(data) {
      // Only log if response was successful
      if (data && data.success !== false && res.statusCode < 400) {
        const targetId = getTargetId ? getTargetId(req) : (req.params.userId || req.params.id);
        const details = getDetails ? getDetails(req) : req.body;
        
        // Log action asynchronously (don't wait)
        logAdminAction(req, action, targetType, targetId, details).catch(err => {
          console.error('Failed to log admin action:', err);
        });
      }
      
      // Call original json method
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Middleware to check if user is active (not banned/suspended)
 * @returns {Function} Express middleware
 */
export const requireActiveUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentication required' 
      });
    }
    
    if (req.user.status === 'banned') {
      return res.status(403).json({ 
        success: false,
        error: 'Your account has been banned',
        reason: req.user.banDetails?.reason,
        bannedAt: req.user.banDetails?.bannedAt
      });
    }
    
    if (req.user.status === 'suspended') {
      const suspendedUntil = req.user.suspensionDetails?.suspendedUntil;
      if (suspendedUntil && new Date() < new Date(suspendedUntil)) {
        return res.status(403).json({ 
          success: false,
          error: 'Your account is suspended',
          reason: req.user.suspensionDetails?.reason,
          suspendedUntil: suspendedUntil
        });
      } else {
        // Suspension expired, reactivate user
        req.user.status = 'active';
        await req.user.save();
      }
    }
    
    next();
  } catch (error) {
    console.error('Active user check error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'User status check failed' 
    });
  }
};

export default {
  requirePermission,
  requireRole,
  requireAdmin,
  canActOnTarget,
  logAdminAction,
  autoLogAction,
  requireActiveUser
};
