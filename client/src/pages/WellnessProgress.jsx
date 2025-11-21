import { useState, useEffect } from 'react';
import { TrendingUp, Clock, Heart, Award, Calendar, Flame, Star } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const WellnessProgress = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const response = await api.get('/wellness/progress');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!stats || stats.totalCompletions === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Wellness Progress</h1>
          <Card className="text-center py-12">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Your Wellness Journey</h3>
            <p className="text-gray-600 mb-6">Complete activities to track your progress</p>
            <button
              onClick={() => window.location.href = '/wellness'}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Activities
            </button>
          </Card>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const typeData = Object.entries(stats.typeBreakdown).map(([type, data]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    completions: data.completions,
    minutes: data.minutes
  }));

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Wellness Progress</h1>
          <p className="text-xl text-gray-600">Track your wellness journey</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Minutes */}
          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-purple-100">Total Minutes</h3>
              <Clock className="w-5 h-5 text-purple-200" />
            </div>
            <p className="text-4xl font-bold">{stats.totalMinutes}</p>
            <p className="text-sm text-purple-100 mt-1">
              {(stats.totalMinutes / 60).toFixed(1)} hours
            </p>
          </Card>

          {/* Total Completions */}
          <Card className="p-6 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-pink-100">Completions</h3>
              <TrendingUp className="w-5 h-5 text-pink-200" />
            </div>
            <p className="text-4xl font-bold">{stats.totalCompletions}</p>
            <p className="text-sm text-pink-100 mt-1">activities completed</p>
          </Card>

          {/* Current Streak */}
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-orange-100">Current Streak</h3>
              <Flame className="w-5 h-5 text-orange-200" />
            </div>
            <div className="flex items-center gap-2">
              <p className="text-4xl font-bold">{stats.currentStreak}</p>
              <span className="text-3xl">🔥</span>
            </div>
            <p className="text-sm text-orange-100 mt-1">days in a row</p>
          </Card>

          {/* Favorites */}
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-100">Favorites</h3>
              <Heart className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-4xl font-bold">{stats.favorites}</p>
            <p className="text-sm text-blue-100 mt-1">favorite activities</p>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Activities Tried</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.activitiesTried}</p>
            <p className="text-sm text-gray-600 mt-1">different activities</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.recentActivity}</p>
            <p className="text-sm text-gray-600 mt-1">in last 7 days</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Average Rating</h3>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
              <span className="text-yellow-400">★</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">out of 5.0</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Activity Type Distribution - Pie Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Activity Types</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="completions"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Minutes by Type - Bar Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Minutes by Type</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="minutes" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* First Activity */}
            <div className={`p-4 rounded-lg border-2 ${stats.totalCompletions >= 1 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-2">{stats.totalCompletions >= 1 ? '🎉' : '🔒'}</div>
              <h3 className="font-semibold text-gray-900 mb-1">First Steps</h3>
              <p className="text-sm text-gray-600">Complete your first activity</p>
            </div>

            {/* 10 Activities */}
            <div className={`p-4 rounded-lg border-2 ${stats.totalCompletions >= 10 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-2">{stats.totalCompletions >= 10 ? '⭐' : '🔒'}</div>
              <h3 className="font-semibold text-gray-900 mb-1">Getting Started</h3>
              <p className="text-sm text-gray-600">Complete 10 activities</p>
              {stats.totalCompletions < 10 && (
                <p className="text-xs text-gray-500 mt-1">{stats.totalCompletions}/10</p>
              )}
            </div>

            {/* 7 Day Streak */}
            <div className={`p-4 rounded-lg border-2 ${stats.currentStreak >= 7 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-2">{stats.currentStreak >= 7 ? '🔥' : '🔒'}</div>
              <h3 className="font-semibold text-gray-900 mb-1">Week Warrior</h3>
              <p className="text-sm text-gray-600">7 day streak</p>
              {stats.currentStreak < 7 && (
                <p className="text-xs text-gray-500 mt-1">{stats.currentStreak}/7 days</p>
              )}
            </div>

            {/* 50 Activities */}
            <div className={`p-4 rounded-lg border-2 ${stats.totalCompletions >= 50 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-2">{stats.totalCompletions >= 50 ? '🏆' : '🔒'}</div>
              <h3 className="font-semibold text-gray-900 mb-1">Wellness Champion</h3>
              <p className="text-sm text-gray-600">Complete 50 activities</p>
              {stats.totalCompletions < 50 && (
                <p className="text-xs text-gray-500 mt-1">{stats.totalCompletions}/50</p>
              )}
            </div>

            {/* 100 Hours */}
            <div className={`p-4 rounded-lg border-2 ${stats.totalMinutes >= 6000 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-2">{stats.totalMinutes >= 6000 ? '💎' : '🔒'}</div>
              <h3 className="font-semibold text-gray-900 mb-1">Time Master</h3>
              <p className="text-sm text-gray-600">100 hours of practice</p>
              {stats.totalMinutes < 6000 && (
                <p className="text-xs text-gray-500 mt-1">{(stats.totalMinutes / 60).toFixed(1)}/100 hours</p>
              )}
            </div>

            {/* Try All Types */}
            <div className={`p-4 rounded-lg border-2 ${stats.activitiesTried >= 6 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
              <div className="text-4xl mb-2">{stats.activitiesTried >= 6 ? '🌟' : '🔒'}</div>
              <h3 className="font-semibold text-gray-900 mb-1">Explorer</h3>
              <p className="text-sm text-gray-600">Try all activity types</p>
              {stats.activitiesTried < 6 && (
                <p className="text-xs text-gray-500 mt-1">{stats.activitiesTried}/6 types</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default WellnessProgress;
