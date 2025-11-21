import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, Award, TrendingUp, Target, Flame } from 'lucide-react';
import api from '../utils/api';

const ChallengesHub = () => {
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, [filter]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const [challengesRes, myRes] = await Promise.all([
        api.get(`/challenges${params}`),
        api.get('/challenges/my/active')
      ]);
      setChallenges(challengesRes.data.challenges || []);
      setMyChallenges(myRes.data.challenges || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      mindfulness: 'from-purple-500 to-purple-600',
      exercise: 'from-green-500 to-green-600',
      nutrition: 'from-orange-500 to-orange-600',
      sleep: 'from-blue-500 to-blue-600',
      social: 'from-pink-500 to-pink-600',
      gratitude: 'from-yellow-500 to-yellow-600',
      creativity: 'from-indigo-500 to-indigo-600',
      learning: 'from-cyan-500 to-cyan-600',
      mixed: 'from-gray-500 to-gray-600'
    };
    return colors[category] || colors.mixed;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🏆 Wellness Challenges
          </h1>
          <p className="text-gray-600">
            Join challenges, compete with others, and earn certificates
          </p>
        </div>

        {/* My Active Challenges */}
        {myChallenges.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Active Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myChallenges.map((challenge) => (
                <Link key={challenge._id} to={`/challenges/${challenge._id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl border-2 border-blue-300 p-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        In Progress
                      </span>
                      <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{challenge.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {challenge.duration} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.participants.length}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', '30-day', 'group', 'weekly'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'
              }`}
            >
              {type === 'all' ? 'All Challenges' : type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </button>
          ))}
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading challenges...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600">Check back later for new challenges</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/challenges/${challenge._id}`}>
                  <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all h-full">
                    <div className={`h-32 bg-gradient-to-r ${getCategoryColor(challenge.category)} flex items-center justify-center`}>
                      <Trophy className="w-16 h-16 text-white" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {challenge.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{challenge.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{challenge.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Duration
                          </span>
                          <span className="font-semibold text-gray-900">{challenge.duration} days</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Participants
                          </span>
                          <span className="font-semibold text-gray-900">
                            {challenge.participants.length} / {challenge.maxParticipants}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            Points
                          </span>
                          <span className="font-semibold text-gray-900">{challenge.points.completion}</span>
                        </div>
                      </div>

                      <button className={`w-full px-4 py-2 bg-gradient-to-r ${getCategoryColor(challenge.category)} text-white rounded-lg hover:shadow-lg transition-all font-medium`}>
                        View Challenge
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-purple-900 mb-4">How Challenges Work</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-purple-900 mb-1">Join</div>
                <p className="text-purple-800">Choose a challenge that fits your goals</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-purple-900 mb-1">Complete</div>
                <p className="text-purple-800">Check in daily and complete tasks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-purple-900 mb-1">Compete</div>
                <p className="text-purple-800">Climb the leaderboard and earn points</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-purple-900 mb-1">Earn</div>
                <p className="text-purple-800">Get certificates and badges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesHub;
