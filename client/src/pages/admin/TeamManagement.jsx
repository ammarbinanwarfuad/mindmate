import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCog,
  Shield,
  Mail,
  Calendar,
  Activity,
  Plus
} from 'lucide-react';
import api from '../../utils/api';

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'moderator',
    name: ''
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      
      const [teamRes, statsRes] = await Promise.all([
        api.get('/admin/team'),
        api.get('/admin/team/stats/overview')
      ]);

      setTeamMembers(teamRes.data.teamMembers || []);
      setStats(statsRes.data.stats);
    } catch (error) {
      console.error('Error fetching team:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteData.email || !inviteData.role) {
      alert('Email and role are required');
      return;
    }

    try {
      await api.post('/admin/team/invite', inviteData);
      alert('Invitation sent successfully');
      setShowInviteModal(false);
      setInviteData({ email: '', role: 'moderator', name: '' });
      fetchTeam();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to send invitation');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      moderator: 'bg-indigo-100 text-indigo-800',
      advisor: 'bg-green-100 text-green-800',
      helper: 'bg-yellow-100 text-yellow-800'
    };
    return styles[role] || styles.moderator;
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
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Manage admin team members and permissions
          </p>
        </div>

        <button
          onClick={() => setShowInviteModal(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <UserCog className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600 font-medium">Total Team</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.total || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Super Admins</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">
              {stats.byRole?.superAdmins || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Admins</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">
              {stats.byRole?.admins || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Moderators</p>
            <p className="text-3xl font-bold text-indigo-900 mt-2">
              {stats.byRole?.moderators || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">Active Today</p>
            <p className="text-3xl font-bold text-green-900 mt-2">
              {stats.activeToday || 0}
            </p>
          </div>
        </div>
      )}

      {/* Team Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <UserCog className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No team members found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div key={member._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600 font-semibold text-lg">
                        {member.profile?.name?.charAt(0) || 'A'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.profile?.name || 'Unknown'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(member.adminLevel || member.role)}`}>
                          {member.adminLevel || member.role}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>{member.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {new Date(member.createdAt).toLocaleDateString()}</span>
                        </div>
                        {member.lastActive && (
                          <div className="flex items-center space-x-1">
                            <Activity className="w-4 h-4" />
                            <span>Active {new Date(member.lastActive).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {member.permissions && member.permissions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            {member.permissions.length} permissions
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/admin/users/${member._id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions Reference */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Permission Levels</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h3 className="font-semibold text-purple-900 mb-2">Super Admin</h3>
            <p className="text-sm text-purple-700">Full system access and control</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Admin</h3>
            <p className="text-sm text-blue-700">Manage users, content, and moderators</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-indigo-900 mb-2">Moderator</h3>
            <p className="text-sm text-indigo-700">Content moderation and user reports</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-900 mb-2">Advisor</h3>
            <p className="text-sm text-green-700">Crisis management and guidance</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-900 mb-2">Helper</h3>
            <p className="text-sm text-yellow-700">Peer support and assistance</p>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={inviteData.name}
                  onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                  placeholder="Full Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="moderator">Moderator</option>
                  <option value="advisor">Advisor</option>
                  <option value="helper">Helper</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteData({ email: '', role: 'moderator', name: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
