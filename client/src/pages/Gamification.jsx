import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BadgeCollection from '../components/gamification/BadgeCollection';
import ChallengeCard from '../components/gamification/ChallengeCard';
import BadgeUnlockModal from '../components/gamification/BadgeUnlockModal';
import LevelUpModal from '../components/gamification/LevelUpModal';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Gamification = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [unlockedBadge, setUnlockedBadge] = useState(null);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [newLevel, setNewLevel] = useState(null);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      const [statsRes, badgesRes, challengesRes] = await Promise.all([
        api.get('/gamification/stats'),
        api.get('/gamification/badges'),
        api.get('/gamification/challenges')
      ]);

      console.log('Stats response:', statsRes.data);
      console.log('Badges response:', badgesRes.data);
      console.log('Challenges response:', challengesRes.data);

      // Handle response structure - badges and challenges are arrays directly
      setStats(statsRes.data);
      setBadges(Array.isArray(badgesRes.data) ? badgesRes.data : []);
      setChallenges(Array.isArray(challengesRes.data) ? challengesRes.data : []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
      console.error('Error details:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    try {
      const response = await api.post('/gamification/seed');
      console.log('Seed response:', response.data);
      alert('Badges and challenges seeded successfully!');
      fetchGamificationData();
    } catch (error) {
      console.error('Error seeding data:', error);
      console.error('Error response:', error.response?.data);
      alert(`Failed to seed data: ${error.response?.data?.message || error.message}`);
    }
  };

  const getXpPercentage = () => {
    if (!stats) return 0;
    return (stats.xp / stats.xpToNextLevel) * 100;
  };

  const filteredBadges = selectedCategory === 'all'
    ? badges
    : badges.filter(badge => badge.category === selectedCategory);

  // Debug: Show empty state if no badges
  if (!loading && badges.length === 0) {
    console.warn('No badges found! Badges may not be seeded in database.');
  }

  const categories = [
    { id: 'all', name: 'All', icon: '🏆' },
    { id: 'mood', name: 'Mood', icon: '😊' },
    { id: 'journal', name: 'Journal', icon: '📝' },
    { id: 'wellness', name: 'Wellness', icon: '🧘' },
    { id: 'goals', name: 'Goals', icon: '🎯' },
    { id: 'social', name: 'Social', icon: '👥' },
    { id: 'streak', name: 'Streaks', icon: '🔥' },
    { id: 'milestone', name: 'Milestones', icon: '⭐' },
    { id: 'special', name: 'Special', icon: '✨' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎮 Gamification Hub
          </h1>
          <p className="text-gray-600">
            Level up, unlock badges, and complete challenges!
          </p>
        </motion.div>

        {/* Level & XP Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Level {stats?.level || 1}
              </h2>
              <p className="text-gray-600">
                {stats?.xp || 0} / {stats?.xpToNextLevel || 100} XP
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total XP Earned</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.totalXpEarned?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${getXpPercentage()}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-semibold text-gray-700">
                {Math.round(getXpPercentage())}%
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.badgesUnlocked || 0}
              </p>
              <p className="text-sm text-gray-600">Badges</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.challengesCompleted || 0}
              </p>
              <p className="text-sm text-gray-600">Challenges</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.currentStreak || 0}
              </p>
              <p className="text-sm text-gray-600">Day Streak</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.longestStreak || 0}
              </p>
              <p className="text-sm text-gray-600">Best Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Active Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Active Challenges
          </h2>
          {challenges.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No Active Challenges
              </h3>
              <p className="text-gray-600">
                Challenges will appear here once they're created. Click the seed button below to generate them.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onComplete={fetchGamificationData}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Badge Collection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              🏆 Badge Collection
            </h2>
            <p className="text-gray-600">
              {stats?.badgesUnlocked || 0} / {stats?.totalBadges || 0} unlocked
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>

          {badges.length === 0 ? (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No Badges Available
              </h3>
              <p className="text-gray-600 mb-4">
                Badges haven't been seeded yet. Click the button below to seed them now.
              </p>
              <button
                onClick={handleSeedData}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-medium"
              >
                🌱 Seed Badges & Challenges
              </button>
              <p className="text-sm text-gray-500 mt-4">
                This will create 102 badges and daily/weekly challenges.
              </p>
            </div>
          ) : (
            <BadgeCollection
              badges={filteredBadges}
              onBadgeClick={(badge) => {
                if (badge.unlocked) {
                  setUnlockedBadge(badge);
                  setShowBadgeModal(true);
                }
              }}
            />
          )}
        </motion.div>
      </div>

      {/* Modals */}
      {showBadgeModal && unlockedBadge && (
        <BadgeUnlockModal
          badge={unlockedBadge}
          onClose={() => {
            setShowBadgeModal(false);
            setUnlockedBadge(null);
          }}
        />
      )}

      {showLevelUpModal && newLevel && (
        <LevelUpModal
          level={newLevel}
          onClose={() => {
            setShowLevelUpModal(false);
            setNewLevel(null);
          }}
        />
      )}
    </div>
  );
};

export default Gamification;
