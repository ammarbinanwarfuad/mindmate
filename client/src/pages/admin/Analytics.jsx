import { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Activity,
  AlertTriangle,
  Calendar,
  Download,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../../utils/api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');
  const [overview, setOverview] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, userRes, engagementRes] = await Promise.all([
        api.get(`/admin/analytics/overview?period=${period}`),
        api.get(`/admin/analytics/users?period=${period}`),
        api.get(`/admin/analytics/engagement?period=${period}`)
      ]);

      setOverview(overviewRes.data.overview);
      setUserAnalytics(userRes.data.analytics);
      setEngagement(engagementRes.data.engagement);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/analytics/export`,
        { 
          type: 'overview',
          format: 'json',
          period 
        },
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics-${period}-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      alert('Analytics exported successfully');
    } catch (error) {
      alert('Failed to export analytics');
    }
  };

  // Generate mock data for charts (replace with real data from API)
  const generateUserGrowthData = () => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: Math.floor(Math.random() * 50) + (overview?.users?.total || 100) - 25,
      active: Math.floor(Math.random() * 30) + (overview?.users?.active || 50) - 15
    }));
  };

  const roleDistributionData = userAnalytics?.byRole ? 
    Object.entries(userAnalytics.byRole).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Platform insights and statistics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['overview', 'users', 'engagement'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900 mt-2">
                    {overview.users?.total || 0}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    +{overview.users?.newThisWeek || 0} this week
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Activity className="w-8 h-8 text-green-600" />
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-sm text-green-600 font-medium">Active Users</p>
                  <p className="text-3xl font-bold text-green-900 mt-2">
                    {overview.users?.active || 0}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    {Math.round((overview.users?.active / overview.users?.total) * 100) || 0}% of total
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-sm text-purple-600 font-medium">Posts Created</p>
                  <p className="text-3xl font-bold text-purple-900 mt-2">
                    {overview.content?.posts || 0}
                  </p>
                  <p className="text-xs text-purple-600 mt-2">
                    {overview.content?.postsToday || 0} today
                  </p>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                    <Activity className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600 font-medium">Crisis Alerts</p>
                  <p className="text-3xl font-bold text-red-900 mt-2">
                    {overview.crisis?.total || 0}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    {overview.crisis?.active || 0} active
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <LineChartIcon className="w-5 h-5" />
                    <span>User Growth Trend</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={generateUserGrowthData()}>
                      <defs>
                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="users" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorUsers)" name="Total Users" />
                      <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#colorActive)" name="Active Users" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <PieChartIcon className="w-5 h-5" />
                    <span>User Distribution by Role</span>
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={roleDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {roleDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Admin Actions</h3>
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p>Admin action history</p>
                  <p className="text-sm mt-1">Last {overview.adminActions?.today || 0} actions today</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && userAnalytics && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {userAnalytics.totalUsers || 0}
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    +{userAnalytics.growth?.percentage || 0}% growth
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">New Users</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {userAnalytics.newUsers || 0}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    In selected period
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Active Rate</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {userAnalytics.activeRate || 0}%
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Daily active users
                  </p>
                </div>
              </div>

              {/* Role Distribution */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution by Role</h3>
                <div className="space-y-3">
                  {userAnalytics.byRole && Object.entries(userAnalytics.byRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(count / userAnalytics.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-12 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* University Distribution */}
              {userAnalytics.byUniversity && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Universities</h3>
                  <div className="space-y-2">
                    {Object.entries(userAnalytics.byUniversity).slice(0, 5).map(([uni, count]) => (
                      <div key={uni} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-700">{uni}</span>
                        <span className="text-sm font-semibold text-gray-900">{count} users</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Engagement Tab */}
          {activeTab === 'engagement' && engagement && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Posts</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {engagement.posts?.total || 0}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Comments</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {engagement.comments?.total || 0}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Mood Entries</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {engagement.moods?.total || 0}
                  </p>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Journal Entries</h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {engagement.journals?.total || 0}
                  </p>
                </div>
              </div>

              {/* Engagement Metrics */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Average Posts per User</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {engagement.averagePostsPerUser?.toFixed(1) || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Average Comments per Post</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {engagement.averageCommentsPerPost?.toFixed(1) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature Usage */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Mood Tracking', value: engagement.moods?.total || 0 },
                    { name: 'Journal Entries', value: engagement.journals?.total || 0 },
                    { name: 'Community Posts', value: engagement.posts?.total || 0 },
                    { name: 'Comments', value: engagement.comments?.total || 0 }
                  ].map((feature) => (
                    <div key={feature.name} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{feature.name}</span>
                      <span className="text-sm font-semibold text-gray-900">{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
