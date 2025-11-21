import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  AlertTriangle,
  Ban,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  UserX,
  Activity
} from 'lucide-react';
import api from '../../utils/api';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Modal states
  const [showBanModal, setShowBanModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [banReason, setBanReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendDuration, setSuspendDuration] = useState(7);
  const [deleteReason, setDeleteReason] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [permissions, setPermissions] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${id}`);
      setUser(response.data.user);
      setPermissions(response.data.user.userPermissions || {});
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.response?.data?.error || 'Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!banReason || banReason.length < 10) {
      alert('Ban reason must be at least 10 characters');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/users/${id}/ban`, { reason: banReason, permanent: true });
      alert('User banned successfully');
      setShowBanModal(false);
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to ban user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!suspendReason || suspendReason.length < 10) {
      alert('Suspension reason must be at least 10 characters');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/users/${id}/suspend`, { reason: suspendReason, duration: suspendDuration });
      alert(`User suspended for ${suspendDuration} days`);
      setShowSuspendModal(false);
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to suspend user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePermissions = async () => {
    try {
      setActionLoading(true);
      await api.patch(`/admin/users/${id}/permissions`, { userPermissions: permissions });
      alert('Permissions updated successfully');
      setShowPermissionsModal(false);
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update permissions');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteReason || deleteReason.length < 10) {
      alert('Deletion reason must be at least 10 characters');
      return;
    }

    if (confirmEmail !== user.email) {
      alert('Email confirmation does not match');
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(`/admin/users/${id}`, { data: { reason: deleteReason } });
      alert('User deleted successfully');
      navigate('/admin/users');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnban = async () => {
    try {
      await api.post(`/admin/users/${id}/unban`, { notes: 'Unbanned by admin' });
      alert('User unbanned successfully');
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to unban user');
    }
  };

  const handleUnsuspend = async () => {
    try {
      await api.post(`/admin/users/${id}/unsuspend`, { notes: 'Unsuspended by admin' });
      alert('User unsuspended successfully');
      fetchUserDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to unsuspend user');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error || 'User not found'}</p>
        <Link to="/admin/users" className="text-purple-600 hover:underline mt-2 inline-block">
          ← Back to Users
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      suspended: 'bg-yellow-100 text-yellow-800',
      banned: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">Manage user account and permissions</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {user.status === 'banned' ? (
            <button
              onClick={handleUnban}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Unban User</span>
            </button>
          ) : user.status === 'suspended' ? (
            <button
              onClick={handleUnsuspend}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Unsuspend User</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowSuspendModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Suspend</span>
              </button>
              <button
                onClick={() => setShowBanModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Ban className="w-4 h-4" />
                <span>Ban</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-purple-600">
                {user.profile?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {user.profile?.name || 'Unknown User'}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(user.status)}`}>
                {user.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-4 h-4" />
                <span className="capitalize">{user.role}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {user.profile?.university && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Activity className="w-4 h-4" />
                  <span>{user.profile.university}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {user.status === 'banned' && user.banDetails && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">User is Banned</p>
                <p className="text-sm text-red-700 mt-1">Reason: {user.banDetails.reason}</p>
                <p className="text-xs text-red-600 mt-1">
                  Banned on {new Date(user.banDetails.bannedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {user.status === 'suspended' && user.suspensionDetails && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900">User is Suspended</p>
                <p className="text-sm text-yellow-700 mt-1">Reason: {user.suspensionDetails.reason}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Until {new Date(user.suspensionDetails.suspendedUntil).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {['profile', 'permissions', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="mt-1 text-gray-900">{user.profile?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">University</label>
                  <p className="mt-1 text-gray-900">{user.profile?.university || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Year</label>
                  <p className="mt-1 text-gray-900">{user.profile?.year || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className="mt-1 text-gray-900 capitalize">{user.status}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete User Account</span>
                </button>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              {/* Role Assignment Section */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>User Role</span>
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Current Role:</p>
                    <span className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold capitalize">
                      {user.role || 'student'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <select
                      id="newRole"
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      defaultValue={user.role}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="therapist">Therapist</option>
                      <option value="helper">Helper</option>
                      <option value="advisor">Advisor</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button
                      onClick={async () => {
                        const newRole = document.getElementById('newRole').value;
                        if (newRole === user.role) {
                          alert('Please select a different role');
                          return;
                        }
                        if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
                          try {
                            await api.post(`/admin/users/${id}/assign-role`, { role: newRole });
                            alert('Role updated successfully!');
                            fetchUserDetails();
                          } catch (err) {
                            alert(err.response?.data?.error || 'Failed to update role');
                          }
                        }
                      }}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Assign Role
                    </button>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded-lg border border-purple-100">
                  <p className="text-xs text-gray-600">
                    <strong>Role Hierarchy:</strong> Super Admin → Admin → Moderator → Advisor → Helper → Therapist → Teacher → Student
                  </p>
                </div>
              </div>

              {/* Individual Permissions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Individual Permissions</h3>
                  <button
                    onClick={() => setShowPermissionsModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Permissions</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(user.userPermissions || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {value ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Activity tracking coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ban User</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently ban the user from accessing the platform.
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Enter ban reason (minimum 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              rows="4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleBanUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Banning...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Suspend User</h3>
            <p className="text-sm text-gray-600 mb-4">
              Temporarily suspend the user for a specified duration.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                value={suspendDuration}
                onChange={(e) => setSuspendDuration(parseInt(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter suspension reason (minimum 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
              rows="4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSuspendUser}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Suspending...' : 'Suspend User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Permissions</h3>
            <div className="space-y-3 mb-4">
              {Object.entries(permissions).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <span className="text-sm font-medium text-gray-700">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                    className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                </label>
              ))}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePermissions}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Delete User Account</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 font-medium">⚠️ This action cannot be undone!</p>
            </div>
            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter deletion reason (minimum 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows="3"
            />
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm by typing user's email: <span className="font-bold">{user.email}</span>
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="Type email to confirm"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;
