import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ChallengeCard = ({ challenge, onComplete }) => {
  const navigate = useNavigate();
  const getProgressPercentage = () => {
    return Math.min((challenge.progress / challenge.requirement.target) * 100, 100);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d remaining`;
    return `${hours}h remaining`;
  };

  const getCategoryColor = () => {
    switch (challenge.category) {
      case 'mood':
        return 'from-blue-500 to-blue-600';
      case 'journal':
        return 'from-purple-500 to-purple-600';
      case 'wellness':
        return 'from-green-500 to-green-600';
      case 'goals':
        return 'from-orange-500 to-orange-600';
      case 'social':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const isCompleted = challenge.isCompleted || challenge.progress >= challenge.requirement.target;

  const getActionButton = () => {
    if (isCompleted) return null;

    const actionMap = {
      'mood': { text: 'Log Mood', path: '/mood', icon: '😊' },
      'journal': { text: 'Write Journal', path: '/resources/journal', icon: '📝' },
      'wellness': { text: 'Start Activity', path: '/wellness', icon: '🧘' },
      'goals': { text: 'View Goals', path: '/goals', icon: '🎯' },
      'social': { text: 'Visit Community', path: '/community', icon: '👥' },
    };

    const action = actionMap[challenge.category] || { text: 'Go', path: '/dashboard', icon: '🚀' };

    return (
      <button
        onClick={() => navigate(action.path)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium shadow-md hover:shadow-lg"
      >
        <span>{action.icon}</span>
        <span>{action.text}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white rounded-xl shadow-md p-6 border-2 ${
        isCompleted ? 'border-green-400 bg-green-50' : 'border-gray-200'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{challenge.icon}</div>
          <div>
            <h3 className="font-bold text-gray-900">{challenge.title}</h3>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>
        </div>
        {isCompleted && (
          <div className="text-2xl">✅</div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {challenge.progress} / {challenge.requirement.target}
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(getProgressPercentage())}%
          </span>
        </div>
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getCategoryColor()} rounded-full`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getCategoryColor()}`}>
            {challenge.type.toUpperCase()}
          </span>
          <span className="text-xs font-semibold text-purple-600">
            +{challenge.xpReward} XP
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {getTimeRemaining()}
        </span>
      </div>

      {/* Action Button */}
      {getActionButton()}

      {/* Completion Message */}
      {isCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center"
        >
          <p className="text-sm font-semibold text-green-800">
            🎉 Challenge Completed! +{challenge.xpReward} XP
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ChallengeCard;
