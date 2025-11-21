import { useState } from 'react';
import { Check, Flame, MoreVertical, Edit, Trash, Pause, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import Button from '../ui/Button';
import HabitTracker from './HabitTracker';
import api from '../../utils/api';

const GoalCard = ({ goal, onUpdate }) => {
  const [showTracker, setShowTracker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [logging, setLogging] = useState(false);

  const handleLogCompletion = async () => {
    if (logging) return;
    
    setLogging(true);
    try {
      const response = await api.post(`/goals/${goal._id}/log`);
      
      if (response.data.isCompleted) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      if (response.data.newMilestones && response.data.newMilestones.length > 0) {
        response.data.newMilestones.forEach(milestone => {
          alert(`🎉 New Milestone Unlocked: ${milestone.icon} ${milestone.title}!`);
        });
      }
      
      onUpdate();
    } catch (error) {
      console.error('Error logging completion:', error);
      alert('Failed to log completion');
    } finally {
      setLogging(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/goals/${goal._id}`, { status: newStatus });
      setShowMenu(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await api.delete(`/goals/${goal._id}`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Failed to delete goal');
    }
  };

  const getFrequencyText = () => {
    switch (goal.frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return goal.frequency;
    }
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
      >
        {/* Header */}
        <div 
          className="p-6 pb-4"
          style={{ 
            background: `linear-gradient(135deg, ${goal.color}20 0%, ${goal.color}10 100%)`,
            borderBottom: `3px solid ${goal.color}`
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{goal.icon}</span>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{goal.title}</h3>
                <p className="text-sm text-gray-600">{getFrequencyText()}</p>
              </div>
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => setShowTracker(true)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    View Details
                  </button>
                  {goal.status === 'active' && (
                    <button
                      onClick={() => handleStatusChange('paused')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Pause className="w-4 h-4" />
                      Pause Goal
                    </button>
                  )}
                  {goal.status === 'paused' && (
                    <button
                      onClick={() => handleStatusChange('active')}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Resume Goal
                    </button>
                  )}
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash className="w-4 h-4" />
                    Delete Goal
                  </button>
                </div>
              )}
            </div>
          </div>

          {goal.description && (
            <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
          )}

          {/* Streak */}
          {goal.streak > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">
                {goal.streak} day streak!
              </span>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="p-6 pt-4">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-bold text-gray-900">
                {goal.currentProgress} / {goal.target}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goal.progressPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ backgroundColor: goal.color }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {goal.progressPercentage}% Complete
            </p>
          </div>

          {/* Action Button */}
          {goal.status === 'active' && (
            <Button
              onClick={handleLogCompletion}
              disabled={logging}
              className="w-full"
              style={{ backgroundColor: goal.color }}
            >
              <Check className="w-4 h-4" />
              {logging ? 'Logging...' : 'Mark Complete'}
            </Button>
          )}

          {goal.status === 'completed' && (
            <div className="text-center py-2 bg-green-50 rounded-lg">
              <span className="text-green-700 font-semibold">✓ Goal Completed!</span>
            </div>
          )}

          {goal.status === 'paused' && (
            <div className="text-center py-2 bg-gray-50 rounded-lg">
              <span className="text-gray-600 font-semibold">⏸ Paused</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Habit Tracker Modal */}
      {showTracker && (
        <HabitTracker
          goal={goal}
          onClose={() => {
            setShowTracker(false);
            onUpdate();
          }}
        />
      )}
    </>
  );
};

export default GoalCard;
