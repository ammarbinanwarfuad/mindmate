import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const XPNotification = ({ xpEarned, action, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getActionEmoji = (action) => {
    const emojiMap = {
      mood_log: '😊',
      journal_entry: '📝',
      meditation_complete: '🧘',
      breathing_exercise: '🌬️',
      yoga_complete: '🧘‍♀️',
      sound_therapy: '🎵',
      goal_created: '🎯',
      goal_completed: '✅',
      buddy_matched: '🤝',
      message_sent: '💬',
      check_in: '✔️',
      shared_activity: '🎮',
      shared_goal: '🎯',
      safety_plan_created: '🛡️',
      resource_shared: '📚'
    };
    return emojiMap[action] || '⭐';
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.8 }}
        className="fixed top-20 right-4 z-50"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 0.5,
            repeat: 2
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-2xl p-4 min-w-[250px]"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.6,
                repeat: 1
              }}
              className="text-3xl"
            >
              {getActionEmoji(action)}
            </motion.div>
            <div className="flex-1">
              <p className="font-bold text-lg">+{xpEarned} XP</p>
              <p className="text-sm opacity-90">
                {action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                duration: 0.4,
                repeat: 3
              }}
              className="text-2xl"
            >
              ✨
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default XPNotification;
