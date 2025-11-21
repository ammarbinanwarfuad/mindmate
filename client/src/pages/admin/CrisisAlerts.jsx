import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  AlertTriangle,
  Phone,
  CheckCircle,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertOctagon,
  Activity
} from 'lucide-react';
import api from '../../utils/api';

const CrisisAlerts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    severity: searchParams.get('severity') || '',
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page')) || 1
  });

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showHandleModal, setShowHandleModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [notes, setNotes] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [filters]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', 20);

      const response = await api.get(`/admin/crisis?${params}`);

      setAlerts(response.data.alerts || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    setFilters({ ...filters, page: newPage });
  };

  const handleMarkAsHandled = async () => {
    if (!notes || notes.length < 10) {
      alert('Notes must be at least 10 characters');
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/admin/crisis/${selectedAlert._id}/handle`, {
        action: 'contacted_user',
        notes
      });
      alert('Alert marked as handled');
      setShowHandleModal(false);
      setNotes('');
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to handle alert');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!contactInfo || contactInfo.length < 10) {
      alert('Contact information must be at least 10 characters');
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/admin/crisis/${selectedAlert._id}/escalate`, {
        service: 'Emergency Services',
        contactPerson: contactInfo,
        notes
      });
      alert('Alert escalated to emergency services');
      setShowEscalateModal(false);
      setContactInfo('');
      setNotes('');
      fetchAlerts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to escalate alert');
    } finally {
      setActionLoading(false);
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-600 text-white'
    };
    return styles[severity] || styles.low;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon className="w-5 h-5" />;
    return <AlertTriangle className="w-5 h-5" />;
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-red-100 text-red-800',
      handled: 'bg-green-100 text-green-800',
      escalated: 'bg-purple-100 text-purple-800'
    };
    return styles[status] || styles.active;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crisis Alerts</h1>
          <p className="text-gray-600 mt-1">
            Monitor and respond to crisis situations
          </p>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center space-x-4">
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-red-600">Active Alerts</p>
                <p className="text-lg font-bold text-red-900">
                  {alerts.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filters.severity}
            onChange={(e) => handleFilterChange('severity', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="handled">Handled</option>
            <option value="escalated">Escalated</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setFilters({ search: '', severity: '', status: '', page: 1 });
              setSearchParams({});
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No crisis alerts found</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                alert.severity === 'critical' ? 'border-red-500' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity === 'critical' ? 'bg-red-600' : 'bg-red-100'
                    }`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {alert.type || 'Crisis Alert'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="text-xs text-gray-600">User</p>
                          <p className="text-sm font-medium text-gray-900">
                            {alert.userId?.profile?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {alert.userId?.email || 'N/A'}
                          </p>
                        </div>
                      </div>
                      {alert.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-600" />
                          <div>
                            <p className="text-xs text-gray-600">Location</p>
                            <p className="text-sm font-medium text-gray-900">
                              {alert.location}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  {alert.message && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-700">{alert.message}</p>
                    </div>
                  )}

                  {/* Notes */}
                  {alert.notes && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-xs font-medium text-green-900 mb-1">Handler Notes</p>
                      <p className="text-sm text-green-800">{alert.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowDetailsModal(true);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    View Details
                  </button>
                  {alert.status === 'active' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowHandleModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Handled</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowEscalateModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Escalate</span>
                      </button>
                    </>
                  )}
                  <Link
                    to={`/admin/users/${alert.userId?._id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                  >
                    View User
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span> of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-1 bg-white border border-gray-300 rounded-lg">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getSeverityBadge(selectedAlert.severity)}`}>
                  {selectedAlert.severity}
                </span>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(selectedAlert.status)}`}>
                  {selectedAlert.status}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-gray-900">{selectedAlert.type || 'N/A'}</p>
              </div>

              {selectedAlert.message && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <p className="mt-1 text-gray-900">{selectedAlert.message}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-gray-900">
                    {selectedAlert.userId?.profile?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedAlert.userId?.email || 'N/A'}
                  </p>
                </div>
                {selectedAlert.location && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-gray-900">{selectedAlert.location}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Created At</label>
                <p className="mt-1 text-gray-900">
                  {new Date(selectedAlert.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedAlert.notes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-green-900">Handler Notes</label>
                  <p className="mt-1 text-green-800">{selectedAlert.notes}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Handle Modal */}
      {showHandleModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark as Handled</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add notes about how this crisis was handled.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedAlert.type || 'Crisis Alert'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                User: {selectedAlert.userId?.profile?.name || 'Unknown'}
              </p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter handling notes (minimum 10 characters)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4"
              rows="4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowHandleModal(false);
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsHandled}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Saving...' : 'Mark Handled'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Escalate to Emergency Services</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800 font-medium">⚠️ This will escalate the alert to emergency services</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg mb-4">
              <p className="text-sm font-medium text-gray-900">
                {selectedAlert.type || 'Crisis Alert'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                User: {selectedAlert.userId?.profile?.name || 'Unknown'}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Information
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Phone number or contact details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              rows="3"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowEscalateModal(false);
                  setContactInfo('');
                  setNotes('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleEscalate}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Escalating...' : 'Escalate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrisisAlerts;
