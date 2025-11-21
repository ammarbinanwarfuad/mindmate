import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Edit,
  Trash2,
  Users,
  Calendar,
  TrendingUp
} from 'lucide-react';
import api from '../../utils/api';

const ContentManagement = () => {
  const [challenges, setChallenges] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      setLoading(true);
      const [challengesRes, statsRes] = await Promise.all([
        api.get('/admin/content/challenges'),
        api.get('/admin/content/stats')
      ]);

      setChallenges(challengesRes.data.challenges || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching content:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (id) => {
    const reason = prompt('Enter deletion reason (minimum 10 characters):');
    if (!reason || reason.length < 10) {
      alert('Valid reason required');
      return;
    }

    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      await api.delete(`/admin/content/challenges/${id}`, {
        data: { reason }
      });
      alert('Challenge deleted successfully');
      fetchContent();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete challenge');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600 mt-1">
            Manage challenges, resources, and announcements
          </p>
        </div>

        <Link
          to="/challenges"
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Challenge</span>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Challenges</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.challenges?.total || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Active Challenges</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.challenges?.active || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Participants</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.participants || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Completed</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.challenges?.completed || 0}
            </p>
          </div>
        </div>
      )}

      {/* Challenges List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Wellness Challenges</h2>
        </div>

        {challenges.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No challenges found</p>
            <Link
              to="/challenges"
              className="text-purple-600 hover:underline mt-2 inline-block"
            >
              Create your first challenge
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {challenges.map((challenge) => (
              <div key={challenge._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {challenge.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        challenge.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : challenge.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {challenge.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {challenge.description}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{challenge.participants?.length || 0} participants</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{challenge.duration} days</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4" />
                        <span className="capitalize">{challenge.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      to={`/challenges/${challenge._id}`}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteChallenge(challenge._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resources & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Resources</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Resource management coming soon</p>
            <p className="text-sm mt-1">Add wellness resources and guides</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
          <div className="text-center py-8 text-gray-500">
            <p>Announcement management coming soon</p>
            <p className="text-sm mt-1">Create platform-wide announcements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
