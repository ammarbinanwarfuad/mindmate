import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGamification } from '../context/GamificationContext';
import { TrendingUp, MessageCircle, Users, Heart, Calendar, Sparkles, Trophy, Lightbulb, Stethoscope, ClipboardList, Link2, Brain } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { fetchUserStats } = useGamification();
  const [stats, setStats] = useState(null);
  const [moodStats, setMoodStats] = useState(null);
  const [streak, setStreak] = useState(null);
  const [goalStats, setGoalStats] = useState(null);
  const [gamificationStats, setGamificationStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, moodRes, streakRes, goalsRes, gamificationRes] = await Promise.all([
          api.get('/user/stats'),
          api.get('/mood/stats?days=7'),
          api.get('/mood-analytics/streak'),
          api.get('/goals/stats/overview'),
          fetchUserStats()
        ]);
        setStats(statsRes.data.stats);
        setMoodStats(moodRes.data.stats);
        setStreak(streakRes.data.streak);
        setGoalStats(goalsRes.data.stats);
        setGamificationStats(gamificationRes);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchUserStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Log Your Mood',
      description: 'Track how you\'re feeling today',
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      link: '/mood',
      color: 'from-primary-500 to-primary-600'
    },
    {
      title: 'Wellness Activities',
      description: 'Guided meditation & exercises',
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      link: '/wellness',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Your Goals',
      description: 'Track habits & milestones',
      icon: <TrendingUp className="w-8 h-8 text-teal-600" />,
      link: '/goals',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'Gamification',
      description: 'Level up & earn badges',
      icon: <Trophy className="w-8 h-8 text-yellow-600" />,
      link: '/gamification',
      color: 'from-yellow-500 to-orange-600'
    },
    {
      title: 'Chat with AI',
      description: 'Talk to your AI companion',
      icon: <MessageCircle className="w-8 h-8 text-secondary-600" />,
      link: '/chat',
      color: 'from-secondary-500 to-secondary-600'
    },
    {
      title: 'Community',
      description: 'Connect with peers',
      icon: <Users className="w-8 h-8 text-green-600" />,
      link: '/community',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Find Matches',
      description: 'Meet supportive peers',
      icon: <Heart className="w-8 h-8 text-pink-600" />,
      link: '/matches',
      color: 'from-pink-500 to-pink-600'
    },
    {
      title: 'CBT Tools',
      description: 'Cognitive behavioral therapy',
      icon: <Lightbulb className="w-8 h-8 text-indigo-600" />,
      link: '/cbt-tools',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Find a Therapist',
      description: 'Connect with professionals',
      icon: <Stethoscope className="w-8 h-8 text-emerald-600" />,
      link: '/therapists',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Self-Assessments',
      description: 'Track mental health metrics',
      icon: <ClipboardList className="w-8 h-8 text-cyan-600" />,
      link: '/assessments',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      title: 'Social Hub',
      description: 'Connect and collaborate',
      icon: <Users className="w-8 h-8 text-rose-600" />,
      link: '/social-hub',
      color: 'from-rose-500 to-rose-600'
    },
    {
      title: 'Wellness Challenges',
      description: 'Join 30-day challenges',
      icon: <Trophy className="w-8 h-8 text-amber-600" />,
      link: '/challenges',
      color: 'from-amber-500 to-amber-600'
    },
    {
      title: 'Integrations',
      description: 'Connect your apps',
      icon: <Link2 className="w-8 h-8 text-teal-600" />,
      link: '/integrations',
      color: 'from-teal-500 to-teal-600'
    },
    {
      title: 'AI Insights',
      description: 'Personalized AI analysis',
      icon: <Brain className="w-8 h-8 text-violet-600" />,
      link: '/ai-insights',
      color: 'from-violet-500 to-violet-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.name || 'there'}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Here's your mental wellness overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm font-medium mb-1">Mood Entries</p>
                <p className="text-3xl font-bold">{stats?.moodEntries || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-primary-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm font-medium mb-1">Forum Posts</p>
                <p className="text-3xl font-bold">{stats?.forumPosts || 0}</p>
              </div>
              <MessageCircle className="w-12 h-12 text-secondary-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Connections</p>
                <p className="text-3xl font-bold">{stats?.matches || 0}</p>
              </div>
              <Users className="w-12 h-12 text-green-200" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-1">Avg Mood (7d)</p>
                <p className="text-3xl font-bold">
                  {moodStats?.averageMood ? `${moodStats.averageMood}/10` : 'N/A'}
                </p>
              </div>
              <Sparkles className="w-12 h-12 text-pink-200" />
            </div>
          </Card>
        </div>

        {/* Gamification Summary */}
        {gamificationStats && (
          <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🎮 Level {gamificationStats.level} • {gamificationStats.xp}/{gamificationStats.xpToNextLevel} XP
                </h3>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-3 max-w-md">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                    style={{ width: `${(gamificationStats.xp / gamificationStats.xpToNextLevel) * 100}%` }}
                  />
                </div>
                <p className="text-gray-600">
                  🏆 {gamificationStats.badgesUnlocked} badges • 
                  🎯 {gamificationStats.challengesCompleted} challenges • 
                  🔥 {gamificationStats.currentStreak} day streak
                </p>
              </div>
              <Link to="/gamification">
                <Button>View Progress</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Mood Analytics Summary */}
        {streak && streak.currentStreak > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🔥 {streak.currentStreak} Day Streak!
                </h3>
                <p className="text-gray-600">
                  Keep logging your mood daily. Longest streak: {streak.longestStreak} days
                </p>
              </div>
              <Link to="/mood-analytics">
                <Button>View Analytics</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Mood Trend */}
        {moodStats && moodStats.totalEntries > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Your Mood Trend</h2>
              <Link to="/mood-analytics">
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4" />
                  Full Analytics
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-4 py-2 rounded-lg ${
                moodStats.trend === 'improving' ? 'bg-green-100 text-green-700' :
                moodStats.trend === 'declining' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                <span className="font-semibold capitalize">{moodStats.trend}</span>
              </div>
              <p className="text-gray-600">
                {moodStats.trend === 'improving' && '🎉 Your mood has been improving! Keep it up!'}
                {moodStats.trend === 'declining' && '💙 Your mood seems lower. Consider reaching out for support.'}
                {moodStats.trend === 'stable' && '✨ Your mood has been stable. That\'s great!'}
              </p>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card hover className="h-full">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Goals Summary */}
        {goalStats && goalStats.activeGoals > 0 && (
          <Card className="mb-8 bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🎯 Your Goals
                </h3>
                <p className="text-gray-600 mb-4">
                  {goalStats.activeGoals} active goal{goalStats.activeGoals !== 1 ? 's' : ''} • 
                  {goalStats.completedGoals} completed • 
                  {goalStats.currentStreak} day streak 🔥
                </p>
                {goalStats.recentActivity > 0 && (
                  <p className="text-sm text-green-600">
                    ✓ {goalStats.recentActivity} completion{goalStats.recentActivity !== 1 ? 's' : ''} this week
                  </p>
                )}
              </div>
              <Link to="/goals">
                <Button>View Goals</Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Wellness Tips */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Daily Wellness Tip</h3>
              <p className="text-gray-700">
                Take a 5-minute break every hour to stretch and breathe deeply. 
                This simple practice can significantly reduce stress and improve focus.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
