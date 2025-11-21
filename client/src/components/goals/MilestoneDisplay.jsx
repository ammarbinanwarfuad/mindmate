import { useState, useEffect } from 'react';
import { Award, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import api from '../../utils/api';

const MilestoneDisplay = () => {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // All available badges
  const allBadges = [
    { id: 'first_goal', title: 'Goal Getter', description: 'Complete your first goal', icon: '🎯', requirement: 1 },
    { id: 'five_goals', title: 'Achiever', description: 'Complete 5 goals', icon: '⭐', requirement: 5 },
    { id: 'ten_goals', title: 'Goal Master', description: 'Complete 10 goals', icon: '🏆', requirement: 10 },
    { id: 'week_streak', title: 'Week Warrior', description: '7-day streak', icon: '🔥', requirement: 7 },
    { id: 'month_streak', title: 'Consistency King', description: '30-day streak', icon: '👑', requirement: 30 },
    { id: 'hundred_streak', title: 'Century Club', description: '100-day streak', icon: '💯', requirement: 100 },
    { id: 'fifty_completions', title: 'Dedicated', description: '50 total completions', icon: '💪', requirement: 50 },
    { id: 'hundred_completions', title: 'Committed', description: '100 total completions', icon: '🌟', requirement: 100 },
    { id: 'five_hundred_completions', title: 'Unstoppable', description: '500 total completions', icon: '🚀', requirement: 500 }
  ];

  useEffect(() => {
    fetchMilestones();
  }, []);

  const fetchMilestones = async () => {
    try {
      const response = await api.get('/goals/milestones/earned');
      setMilestones(response.data.milestones);
    } catch (error) {
      console.error('Error fetching milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const isUnlocked = (badgeId) => {
    return milestones.some(m => m.badgeId === badgeId);
  };

  const getUnlockDate = (badgeId) => {
    const milestone = milestones.find(m => m.badgeId === badgeId);
    return milestone ? new Date(milestone.unlockedAt).toLocaleDateString() : null;
  };

  if (loading) return null;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Award className="w-6 h-6 text-yellow-600" />
        <h3 className="text-2xl font-bold text-gray-900">Milestones & Badges</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {allBadges.map((badge, index) => {
          const unlocked = isUnlocked(badge.id);
          const unlockDate = getUnlockDate(badge.id);

          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${unlocked 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg' 
                  : 'bg-gray-50 border-gray-200 opacity-60'
                }
              `}
            >
              {/* Badge Icon */}
              <div className="text-center mb-3">
                <div className={`text-5xl mb-2 ${unlocked ? '' : 'grayscale opacity-50'}`}>
                  {badge.icon}
                </div>
                {!unlocked && (
                  <Lock className="w-4 h-4 text-gray-400 mx-auto" />
                )}
              </div>

              {/* Badge Info */}
              <div className="text-center">
                <h4 className={`font-bold text-sm mb-1 ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                  {badge.title}
                </h4>
                <p className={`text-xs mb-2 ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                  {badge.description}
                </p>
                
                {unlocked ? (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Unlocked {unlockDate}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">
                    Locked
                  </span>
                )}
              </div>

              {/* Shine effect for unlocked badges */}
              {unlocked && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shine" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-700">
          <span className="font-bold text-2xl text-primary-600">{milestones.length}</span>
          <span className="text-gray-600"> / {allBadges.length} badges unlocked</span>
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div 
            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(milestones.length / allBadges.length) * 100}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shine {
          animation: shine 3s infinite;
        }
      `}</style>
    </Card>
  );
};

export default MilestoneDisplay;
