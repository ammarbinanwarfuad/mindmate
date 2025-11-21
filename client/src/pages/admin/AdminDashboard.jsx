import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  AlertTriangle,
  TrendingUp,
  UserPlus,
  Activity,
  Award,
  Clock
} from 'lucide-react';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, userStatsRes, crisisRes] = await Promise.all([
        api.get('/admin/analytics/overview'),
        api.get('/admin/users/stats/overview'),
        api.get('/admin/crisis/stats/overview')
      ]);

      setStats({
        overview: overviewRes.data.overview,
        users: userStatsRes.data.stats,
        crisis: crisisRes.data.stats
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load Dashboard</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
        <div className="mt-4 p-3 bg-white rounded border border-red-200">
          <p className="text-sm text-gray-600">
            <strong>Possible issues:</strong><br/>
            1. Backend server not running<br/>
            2. Admin routes not accessible<br/>
            3. Check browser console (F12) for details
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      change: `+${stats?.overview?.users?.newToday || 0} today`,
      icon: Users,
      color: 'bg-blue-500',
      link: '/admin/users'
    },
    {
      title: 'Active Users',
      value: stats?.users?.byStatus?.active || 0,
      change: `${Math.round((stats?.users?.byStatus?.active / stats?.users?.total) * 100) || 0}% of total`,
      icon: Activity,
      color: 'bg-green-500',
      link: '/admin/users?status=active'
    },
    {
      title: 'Crisis Alerts',
      value: stats?.crisis?.byStatus?.active || 0,
      change: `${stats?.crisis?.today || 0} today`,
      icon: AlertTriangle,
      color: 'bg-red-500',
      link: '/admin/crisis'
    },
    {
      title: 'Suspended Users',
      value: stats?.users?.byStatus?.suspended || 0,
      change: 'Requires attention',
      icon: Shield,
      color: 'bg-yellow-500',
      link: '/admin/users?status=suspended'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-purple-100">
          Monitor and manage your MindMate platform from here
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {card.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {card.value}
              </p>
              <p className="text-sm text-gray-500">{card.change}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/users"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">View and manage all users</p>
              </div>
            </Link>

            <Link
              to="/admin/moderation"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="bg-purple-100 p-2 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Content Moderation</p>
                <p className="text-sm text-gray-500">Review flagged content</p>
              </div>
            </Link>

            <Link
              to="/admin/crisis"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Crisis Alerts</p>
                <p className="text-sm text-gray-500">Handle urgent situations</p>
              </div>
            </Link>

            <Link
              to="/admin/content"
              className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="bg-green-100 p-2 rounded-lg">
                <Award className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Content</p>
                <p className="text-sm text-gray-500">Challenges and resources</p>
              </div>
            </Link>
          </div>
        </div>

        {/* User Overview */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Overview
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900">Students</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {stats?.users?.byRole?.students || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900">Teachers</span>
              </div>
              <span className="text-xl font-bold text-purple-600">
                {stats?.users?.byRole?.teachers || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">Admins</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {stats?.users?.byRole?.admins || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-gray-900">New This Week</span>
              </div>
              <span className="text-xl font-bold text-yellow-600">
                {stats?.overview?.users?.newThisWeek || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-700">All Systems Operational</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Database Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">API Responsive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
