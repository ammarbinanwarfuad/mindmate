import { useAuth } from '../../context/AuthContext';

/**
 * PermissionGuard Component
 * Conditionally renders children based on user permissions
 * 
 * @param {string|string[]} permission - Required permission(s)
 * @param {string|string[]} role - Required role(s)
 * @param {boolean} requireAll - If true, user must have ALL permissions (default: false)
 * @param {React.ReactNode} fallback - Component to render if permission check fails
 * @param {React.ReactNode} children - Content to render if permission check passes
 */
const PermissionGuard = ({ 
  permission, 
  role, 
  requireAll = false,
  fallback = null,
  children 
}) => {
  const { user } = useAuth();

  // If no user, don't render
  if (!user) {
    return fallback;
  }

  // Check role if provided
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    const userRole = user.adminLevel || user.role;
    
    if (!roles.includes(userRole)) {
      return fallback;
    }
  }

  // Check permission if provided
  if (permission) {
    const permissions = Array.isArray(permission) ? permission : [permission];
    const userPermissions = user.permissions || [];

    // Super admin has all permissions
    if (userPermissions.includes('*')) {
      return children;
    }

    // Check if user has required permissions
    const hasPermission = requireAll
      ? permissions.every(p => userPermissions.includes(p))
      : permissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return fallback;
    }
  }

  return children;
};

export default PermissionGuard;
