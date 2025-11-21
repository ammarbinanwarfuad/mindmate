import { motion } from 'framer-motion';

const BadgeCollection = ({ badges, onBadgeClick }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'from-gray-400 to-gray-600';
      case 'rare':
        return 'from-blue-400 to-blue-600';
      case 'epic':
        return 'from-purple-400 to-purple-600';
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'border-gray-300';
      case 'rare':
        return 'border-blue-400';
      case 'epic':
        return 'border-purple-400';
      case 'legendary':
        return 'border-yellow-400 shadow-lg shadow-yellow-200';
      default:
        return 'border-gray-300';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {badges.map((badge, index) => (
        <motion.div
          key={badge._id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
          onClick={() => onBadgeClick(badge)}
          className={`relative bg-white rounded-xl p-4 border-2 ${
            badge.unlocked ? getRarityBorder(badge.rarity) : 'border-gray-200'
          } cursor-pointer transition-all hover:scale-105 ${
            badge.unlocked ? 'shadow-md' : 'opacity-50 grayscale'
          }`}
        >
          {/* Badge Icon */}
          <div className="text-5xl mb-2 text-center">
            {badge.unlocked ? badge.icon : '🔒'}
          </div>

          {/* Badge Name */}
          <h3 className={`text-sm font-semibold text-center mb-1 ${
            badge.unlocked ? 'text-gray-900' : 'text-gray-500'
          }`}>
            {badge.unlocked ? badge.name : '???'}
          </h3>

          {/* Rarity Badge */}
          {badge.unlocked && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getRarityColor(badge.rarity)}`}>
              {badge.rarity.toUpperCase()}
            </div>
          )}

          {/* XP Reward */}
          {badge.unlocked && badge.xpReward > 0 && (
            <div className="text-center mt-2">
              <span className="text-xs font-semibold text-purple-600">
                +{badge.xpReward} XP
              </span>
            </div>
          )}

          {/* Unlock Date */}
          {badge.unlocked && badge.unlockedAt && (
            <div className="text-center mt-1">
              <span className="text-xs text-gray-500">
                {new Date(badge.unlockedAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Locked State */}
          {!badge.unlocked && !badge.isHidden && (
            <p className="text-xs text-gray-500 text-center mt-2">
              {badge.requirement.type === 'count' && 
                `${badge.requirement.action}: ${badge.requirement.target}`}
              {badge.requirement.type === 'streak' && 
                `${badge.requirement.target} day streak`}
              {badge.requirement.type === 'milestone' && 
                `Reach milestone`}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BadgeCollection;
