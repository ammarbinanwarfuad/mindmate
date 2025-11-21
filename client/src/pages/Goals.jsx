import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Award, Flame } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import GoalCard from '../components/goals/GoalCard';
import CreateGoalModal from '../components/goals/CreateGoalModal';
import GoalSuggestions from '../components/goals/GoalSuggestions';
import api from '../utils/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('active');

  useEffect(() => {
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [goalsRes, statsRes] = await Promise.all([
        api.get(`/goals?status=${filter}`),
        api.get('/goals/stats/overview')
      ]);
      
      setGoals(goalsRes.data.goals);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = () => {
    setShowCreateModal(false);
    fetchData();
  };

  const handleGoalUpdated = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Goals & Habits</h1>
            <p className="text-xl text-gray-600">Track your progress and build better habits</p>
          </div>
          
          <Button onClick={() => setShowCreateModal(true)} size="lg">
            <Plus className="w-5 h-5" />
            New Goal
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-primary-100">Active Goals</h3>
                <Target className="w-5 h-5 text-primary-200" />
              </div>
              <p className="text-4xl font-bold">{stats.activeGoals}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-green-100">Completed</h3>
                <TrendingUp className="w-5 h-5 text-green-200" />
              </div>
              <p className="text-4xl font-bold">{stats.completedGoals}</p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-orange-100">Current Streak</h3>
                <Flame className="w-5 h-5 text-orange-200" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-4xl font-bold">{stats.currentStreak}</p>
                <span className="text-3xl">🔥</span>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-purple-100">Milestones</h3>
                <Award className="w-5 h-5 text-purple-200" />
              </div>
              <p className="text-4xl font-bold">{stats.totalMilestones}</p>
            </Card>
          </div>
        )}

        {/* Goal Suggestions */}
        {filter === 'active' && goals.length < 3 && (
          <GoalSuggestions onGoalCreated={handleGoalCreated} />
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilter('paused')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'paused'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Paused
          </button>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'active' ? 'No Active Goals' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Goals`}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'active' 
                ? 'Create your first goal to start building better habits'
                : `You don't have any ${filter} goals yet`
              }
            </p>
            {filter === 'active' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Create Goal
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                onUpdate={handleGoalUpdated}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onGoalCreated={handleGoalCreated}
        />
      )}
    </div>
  );
};

export default Goals;
