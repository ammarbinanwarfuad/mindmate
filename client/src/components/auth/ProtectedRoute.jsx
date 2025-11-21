import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required
  if (requireAdmin) {
    const isAdmin = user.role === 'super_admin' || 
                    user.role === 'admin' || 
                    user.adminLevel === 'super_admin' || 
                    user.adminLevel === 'admin' ||
                    user.adminLevel === 'moderator';
    
    if (!isAdmin) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
