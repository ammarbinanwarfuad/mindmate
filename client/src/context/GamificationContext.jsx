import { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import XPNotification from '../components/gamification/XPNotification';
import LevelUpModal from '../components/gamification/LevelUpModal';
import BadgeUnlockModal from '../components/gamification/BadgeUnlockModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GamificationContext = createContext();

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};

export const GamificationProvider = ({ children }) => {
  const [xpNotification, setXpNotification] = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [badgeUnlockData, setBadgeUnlockData] = useState(null);
  const [userStats, setUserStats] = useState(null);

  const awardXP = useCallback(async (action, amount = null) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_URL}/gamification/xp`,
        { action, amount },
        config
      );

      const { xpEarned, newLevel, newBadges, progress } = response.data;

      // Show XP notification
      if (xpEarned > 0) {
        setXpNotification({ xpEarned, action });
      }

      // Show level up modal
      if (newLevel) {
        setTimeout(() => {
          setLevelUpData(newLevel);
        }, 3000);
      }

      // Show badge unlock modals
      if (newBadges && newBadges.length > 0) {
        setTimeout(() => {
          setBadgeUnlockData(newBadges[0]);
        }, newLevel ? 6000 : 3000);
      }

      // Update user stats
      setUserStats(progress);

      return response.data;
    } catch (error) {
      console.error('Error awarding XP:', error);
      return null;
    }
  }, []);

  const updateChallengeProgress = useCallback(async (action, amount = 1) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.post(
        `${API_URL}/gamification/challenge-progress`,
        { action, amount },
        config
      );
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }, []);

  const fetchUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`${API_URL}/gamification/stats`, config);
      setUserStats(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }, []);

  const trackAction = useCallback(async (action, amount = null) => {
    // Award XP and update challenge progress in parallel
    await Promise.all([
      awardXP(action, amount),
      updateChallengeProgress(action, 1)
    ]);
  }, [awardXP, updateChallengeProgress]);

  const value = {
    awardXP,
    updateChallengeProgress,
    fetchUserStats,
    trackAction,
    userStats
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
      
      {/* XP Notification */}
      {xpNotification && (
        <XPNotification
          xpEarned={xpNotification.xpEarned}
          action={xpNotification.action}
          onClose={() => setXpNotification(null)}
        />
      )}

      {/* Level Up Modal */}
      {levelUpData && (
        <LevelUpModal
          level={levelUpData}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* Badge Unlock Modal */}
      {badgeUnlockData && (
        <BadgeUnlockModal
          badge={badgeUnlockData}
          onClose={() => setBadgeUnlockData(null)}
        />
      )}
    </GamificationContext.Provider>
  );
};
