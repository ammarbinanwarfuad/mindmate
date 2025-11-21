/**
 * Permission System for MindMate Admin Panel
 * Defines role-based permissions and helper functions
 */

// Role-based permission mappings
export const ROLE_PERMISSIONS = {
  super_admin: ['*'], // All permissions
  
  admin: [
    // User Management
    'view_users', 'ban_users', 'delete_users', 'suspend_users', 'warn_users', 'edit_permissions',
    // Content Moderation
    'delete_posts', 'hide_posts', 'delete_comments', 'review_reports',
    // Crisis Management
    'view_crisis', 'handle_crisis', 'contact_emergency',
    // Analytics
    'view_analytics', 'export_data', 'view_user_analytics',
    // Content Management
    'create_challenges', 'edit_challenges', 'delete_challenges', 'manage_resources', 'create_announcements',
    // Admin Management
    'create_moderators', 'create_advisors', 'create_helpers', 'revoke_roles'
  ],
  
  moderator: [
    // User Management (limited)
    'view_users', 'suspend_users', 'warn_users',
    // Content Moderation
    'delete_posts', 'hide_posts', 'delete_comments', 'review_reports',
    // Crisis Management (view only)
    'view_crisis',
    // Admin Management (limited)
    'create_helpers'
  ],
  
  advisor: [
    // Crisis Management (view only)
    'view_crisis',
    // Reports (view only)
    'review_reports'
  ],
  
  helper: [
    // Reports (flag only)
    'review_reports'
  ],
  
  // Non-admin roles have no admin permissions
  student: [],
  teacher: [],
  therapist: []
};

// Role hierarchy (higher index = higher authority)
export const ROLE_HIERARCHY = [
  'super_admin',
  'admin',
  'moderator',
  'advisor',
  'helper',
  'therapist',
  'teacher',
  'student'
];

/**
 * Check if user has a specific permission
 * @param {Object} user - User object with role, adminLevel, and permissions
 * @param {String} permission - Permission to check
 * @returns {Boolean}
 */
export function hasPermission(user, permission) {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === 'super_admin' || user.adminLevel === 'super_admin') {
    return true;
  }
  
  // Check if user has specific permission in their permissions array
  if (user.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes(permission) || user.permissions.includes('*')) {
      return true;
    }
  }
  
  // Check role-based permissions
  const roleLevel = user.adminLevel || user.role;
  const rolePerms = ROLE_PERMISSIONS[roleLevel] || [];
  
  return rolePerms.includes(permission) || rolePerms.includes('*');
}

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean}
 */
export function hasAnyPermission(user, permissions) {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object
 * @param {Array} permissions - Array of permissions to check
 * @returns {Boolean}
 */
export function hasAllPermissions(user, permissions) {
  if (!user || !Array.isArray(permissions)) return false;
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Check if admin can manage a specific role
 * @param {Object} adminUser - Admin user object
 * @param {String} targetRole - Role to manage
 * @returns {Boolean}
 */
export function canManageRole(adminUser, targetRole) {
  if (!adminUser || !targetRole) return false;
  
  // Super admin can manage everyone
  if (adminUser.role === 'super_admin' || adminUser.adminLevel === 'super_admin') {
    return true;
  }
  
  const adminLevel = adminUser.adminLevel || adminUser.role;
  const adminIndex = ROLE_HIERARCHY.indexOf(adminLevel);
  const targetIndex = ROLE_HIERARCHY.indexOf(targetRole);
  
  // Can only manage roles below your level (higher index = lower authority)
  return adminIndex !== -1 && targetIndex !== -1 && adminIndex < targetIndex;
}

/**
 * Check if user can perform action on target user
 * @param {Object} actorUser - User performing the action
 * @param {Object} targetUser - User being acted upon
 * @returns {Boolean}
 */
export function canActOnUser(actorUser, targetUser) {
  if (!actorUser || !targetUser) return false;
  
  // Super admin can act on everyone except other super admins
  if (actorUser.role === 'super_admin' || actorUser.adminLevel === 'super_admin') {
    return targetUser.role !== 'super_admin' && targetUser.adminLevel !== 'super_admin';
  }
  
  // Cannot act on users of equal or higher role
  return canManageRole(actorUser, targetUser.role || targetUser.adminLevel || 'student');
}

/**
 * Get all permissions for a role
 * @param {String} role - Role name
 * @returns {Array}
 */
export function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if role is admin-level
 * @param {String} role - Role name
 * @returns {Boolean}
 */
export function isAdminRole(role) {
  return ['super_admin', 'admin', 'moderator', 'advisor', 'helper'].includes(role);
}

/**
 * Get user's effective role (adminLevel takes precedence)
 * @param {Object} user - User object
 * @returns {String}
 */
export function getEffectiveRole(user) {
  if (!user) return 'student';
  return user.adminLevel || user.role || 'student';
}

/**
 * Check if user can access admin panel
 * @param {Object} user - User object
 * @returns {Boolean}
 */
export function canAccessAdminPanel(user) {
  if (!user) return false;
  const effectiveRole = getEffectiveRole(user);
  return isAdminRole(effectiveRole);
}

/**
 * Get permission description
 * @param {String} permission - Permission name
 * @returns {String}
 */
export function getPermissionDescription(permission) {
  const descriptions = {
    // User Management
    'view_users': 'View all users and their profiles',
    'ban_users': 'Ban users permanently or temporarily',
    'delete_users': 'Delete user accounts',
    'suspend_users': 'Suspend users temporarily',
    'warn_users': 'Issue warnings to users',
    'edit_permissions': 'Edit user permissions',
    
    // Content Moderation
    'delete_posts': 'Delete posts and content',
    'hide_posts': 'Hide posts from public view',
    'delete_comments': 'Delete comments',
    'review_reports': 'Review and resolve user reports',
    
    // Crisis Management
    'view_crisis': 'View crisis alerts and flags',
    'handle_crisis': 'Handle crisis situations',
    'contact_emergency': 'Contact emergency services',
    
    // Analytics
    'view_analytics': 'View platform analytics',
    'export_data': 'Export platform data',
    'view_user_analytics': 'View individual user analytics',
    
    // Content Management
    'create_challenges': 'Create wellness challenges',
    'edit_challenges': 'Edit existing challenges',
    'delete_challenges': 'Delete challenges',
    'manage_resources': 'Manage wellness resources',
    'create_announcements': 'Create platform announcements',
    
    // Admin Management
    'create_admins': 'Create new admin accounts',
    'create_moderators': 'Create new moderator accounts',
    'create_advisors': 'Create new advisor accounts',
    'create_helpers': 'Create new helper accounts',
    'revoke_roles': 'Revoke admin roles',
    
    // System
    'system_settings': 'Access system settings',
    'database_access': 'Access database directly',
    'api_config': 'Configure API settings'
  };
  
  return descriptions[permission] || permission;
}

/**
 * Validate permission name
 * @param {String} permission - Permission to validate
 * @returns {Boolean}
 */
export function isValidPermission(permission) {
  const allPermissions = [
    'view_users', 'ban_users', 'delete_users', 'suspend_users', 'warn_users', 'edit_permissions',
    'delete_posts', 'hide_posts', 'delete_comments', 'review_reports',
    'view_crisis', 'handle_crisis', 'contact_emergency',
    'view_analytics', 'export_data', 'view_user_analytics',
    'create_challenges', 'edit_challenges', 'delete_challenges', 'manage_resources', 'create_announcements',
    'create_admins', 'create_moderators', 'create_advisors', 'create_helpers', 'revoke_roles',
    'system_settings', 'database_access', 'api_config'
  ];
  
  return allPermissions.includes(permission) || permission === '*';
}

export default {
  ROLE_PERMISSIONS,
  ROLE_HIERARCHY,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageRole,
  canActOnUser,
  getRolePermissions,
  isAdminRole,
  getEffectiveRole,
  canAccessAdminPanel,
  getPermissionDescription,
  isValidPermission
};
