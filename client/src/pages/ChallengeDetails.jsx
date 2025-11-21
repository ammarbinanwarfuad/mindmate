import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trophy, Users, Calendar, Award, Check, Download, Medal } from 'lucide-react';
import api from '../utils/api';

const ChallengeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchChallengeDetails();
  }, [id]);

  const fetchChallengeDetails = async () => {
    try {
      const [challengeRes, leaderboardRes] = await Promise.all([
        api.get(`/challenges/${id}`),
        api.get(`/challenges/${id}/leaderboard`)
      ]);
      
      setChallenge(challengeRes.data.challenge);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      
      // Find user's progress
      const userParticipant = challengeRes.data.challenge.participants.find(
        p => p.userId._id === challengeRes.data.challenge.participants[0]?.userId._id
      );
      setUserProgress(userParticipant?.progress);
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async () => {
    try {
      await api.post(`/challenges/${id}/join`);
      alert('Successfully joined challenge!');
      fetchChallengeDetails();
    } catch (error) {
      console.error('Error joining challenge:', error);
      alert(error.response?.data?.message || 'Failed to join challenge');
    }
  };

  const handleCompleteDay = async (day) => {
    try {
      await api.post(`/challenges/${id}/complete-day`, { day });
      alert(`Day ${day} completed! +${challenge.points.daily} points`);
      fetchChallengeDetails();
    } catch (error) {
      console.error('Error completing day:', error);
      alert(error.response?.data?.message || 'Failed to complete day');
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      const response = await api.get(`/challenges/${id}/certificate`);
      setCertificate(response.data.certificate);
      setActiveTab('certificate');
    } catch (error) {
      console.error('Error getting certificate:', error);
      alert(error.response?.data?.message || 'Certificate not available');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Challenge not found</h2>
          <button onClick={() => navigate('/challenges')} className="text-blue-600 hover:text-blue-700">
            Back to challenges
          </button>
        </div>
      </div>
    );
  }

  const isParticipant = challenge.participants.some(p => p.userId);
  const completedDays = userProgress?.completedTasks?.length || 0;
  const progressPercentage = (completedDays / challenge.duration) * 100;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/challenges')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Challenges
        </button>

        {/* Header */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{challenge.title}</h1>
              <p className="text-gray-600 mb-4">{challenge.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {challenge.type}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {challenge.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {challenge.difficulty}
                </span>
              </div>
            </div>
            <Trophy className="w-16 h-16 text-yellow-500" />
          </div>

          {isParticipant && userProgress && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Your Progress</span>
                <span className="text-sm text-gray-600">{completedDays} / {challenge.duration} days</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-3 text-sm">
                <span className="text-gray-600">🔥 {userProgress.currentStreak} day streak</span>
                <span className="text-gray-600">⭐ {userProgress.totalPoints} points</span>
              </div>
            </div>
          )}

          {!isParticipant && (
            <button
              onClick={handleJoinChallenge}
              className="w-full mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Join Challenge
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {['overview', 'tasks', 'leaderboard', 'certificate'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Challenge Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{challenge.duration}</div>
                <div className="text-sm text-gray-600">Days</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{challenge.participants.length}</div>
                <div className="text-sm text-gray-600">Participants</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Award className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{challenge.points.completion}</div>
                <div className="text-sm text-gray-600">Points</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Trophy className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{challenge.points.daily}</div>
                <div className="text-sm text-gray-600">Daily Points</div>
              </div>
            </div>

            <h4 className="font-bold text-gray-900 mb-3">Goals</h4>
            <ul className="space-y-2">
              {challenge.goals.map((goal, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>{goal.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'tasks' && isParticipant && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Daily Tasks</h3>
            <div className="space-y-3">
              {challenge.dailyTasks.map((task) => {
                const isCompleted = userProgress?.completedTasks?.some(t => t.day === task.day);
                return (
                  <div
                    key={task.day}
                    className={`p-4 rounded-lg border-2 ${
                      isCompleted ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-bold text-gray-900">Day {task.day}</span>
                          {isCompleted && <Check className="w-5 h-5 text-green-600" />}
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-1">{task.task}</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                      {!isCompleted && (
                        <button
                          onClick={() => handleCompleteDay(task.day)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.userId._id}
                  className={`p-4 rounded-lg ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-bold text-gray-900 w-8">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{entry.name}</div>
                      <div className="text-sm text-gray-600">
                        {entry.completedDays} days • {entry.currentStreak} day streak
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{entry.totalPoints}</div>
                      <div className="text-sm text-gray-600">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'certificate' && (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
            {certificate ? (
              <div className="max-w-2xl mx-auto">
                <div className="border-8 border-double border-yellow-600 p-8 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <div className="text-center">
                    <Medal className="w-20 h-20 text-yellow-600 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Certificate of Completion</h2>
                    <p className="text-gray-600 mb-6">This certifies that</p>
                    <h3 className="text-4xl font-bold text-blue-600 mb-6">{certificate.userName}</h3>
                    <p className="text-gray-600 mb-2">has successfully completed</p>
                    <h4 className="text-2xl font-bold text-gray-900 mb-6">{certificate.challengeTitle}</h4>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{certificate.duration}</div>
                        <div className="text-sm text-gray-600">Days</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{certificate.totalPoints}</div>
                        <div className="text-sm text-gray-600">Points</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{certificate.longestStreak}</div>
                        <div className="text-sm text-gray-600">Streak</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Completed on {new Date(certificate.completedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Certificate ID: {certificate.certificateId}</p>
                  </div>
                </div>
                <button
                  onClick={() => window.print()}
                  className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Certificate
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate Not Available</h3>
                <p className="text-gray-600 mb-6">Complete the challenge to earn your certificate</p>
                {isParticipant && userProgress?.status === 'completed' && (
                  <button
                    onClick={handleDownloadCertificate}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Get Certificate
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeDetails;
