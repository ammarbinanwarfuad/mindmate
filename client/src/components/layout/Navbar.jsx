import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Brain, LogOut, User, Settings, Bell, MessageCircle, BookOpen, Wind, Lightbulb, Shield } from 'lucide-react';
import { useState } from 'react';
import Button from '../ui/Button';
import QuickRelief from '../wellness/QuickRelief';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showQuickRelief, setShowQuickRelief] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <Brain className="w-8 h-8 text-primary-600 group-hover:text-primary-700 transition-colors" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              MindMate
            </span>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Dashboard
              </Link>
              <Link to="/mood" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Mood
              </Link>
              <Link to="/chat" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                MindMate
              </Link>
              <Link to="/community" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Community
              </Link>
              <Link to="/matches" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Matches
              </Link>
              <Link to="/wellness" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Wellness
              </Link>
              <Link to="/goals" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Goals
              </Link>
              <Link to="/resources" className="text-gray-700 hover:text-primary-600 transition-colors font-medium">
                Resources
              </Link>
              <Link to="/cbt-tools" className="text-gray-700 hover:text-primary-600 transition-colors font-medium flex items-center gap-1">
                <Lightbulb className="w-4 h-4" />
                CBT Tools
              </Link>

              {/* User Menu */}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                {/* Admin Panel Link - Show for all admins */}
                {user && (user.role === 'super_admin' || user.role === 'admin' || user.adminLevel === 'super_admin' || user.adminLevel === 'admin' || user.adminLevel === 'moderator' || user.permissions?.includes('*')) && (
                  <Link 
                    to="/admin" 
                    className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                    title="Admin Panel"
                  >
                    <Shield className="w-5 h-5 text-purple-600" />
                  </Link>
                )}
                {/* Temporary: Show admin link for debugging - Remove this after testing */}
                {user && !user.role && !user.adminLevel && (
                  <Link 
                    to="/admin" 
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded-lg transition-colors"
                    title="Admin Panel (Debug Mode)"
                  >
                    <Shield className="w-5 h-5 text-yellow-600" />
                  </Link>
                )}
                <button
                  onClick={() => setShowQuickRelief(true)}
                  className="p-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-lg hover:shadow-lg transition-all"
                  title="Quick Relief - Instant calm"
                >
                  <Wind className="w-5 h-5" />
                </button>
                <Link to="/messages" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </Link>
                <Link to="/notifications" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                </Link>
                <Link to="/settings" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <User className="w-5 h-5 text-gray-600" />
                </Link>
                <button onClick={handleLogout} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/mood" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Mood Tracker
                </Link>
                <Link to="/chat" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  MindMate
                </Link>
                <Link to="/community" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Community
                </Link>
                <Link to="/matches" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Matches
                </Link>
                <Link to="/wellness" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Wellness
                </Link>
                <Link to="/goals" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Goals
                </Link>
                <Link to="/resources" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Resources
                </Link>
                <Link to="/cbt-tools" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  CBT Tools
                </Link>
                <Link to="/messages" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Messages
                </Link>
                <Link to="/notifications" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Notifications
                </Link>
                <Link to="/settings" className="block py-2 text-gray-700 hover:text-primary-600 font-medium">
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block">
                  <Button variant="ghost" fullWidth>Sign In</Button>
                </Link>
                <Link to="/register" className="block">
                  <Button fullWidth>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Quick Relief Modal */}
      {showQuickRelief && <QuickRelief onClose={() => setShowQuickRelief(false)} />}
    </nav>
  );
};

export default Navbar;
