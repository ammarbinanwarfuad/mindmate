import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Share2, Copy, X, Check, Eye, EyeOff } from 'lucide-react';
import api from '../../utils/api';

const ProgressShare = ({ therapistId, therapistName }) => {
  const [shares, setShares] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [shareData, setShareData] = useState({
    dataTypes: ['mood', 'journal'],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    shareType: 'one-time',
    expiresIn: 30
  });
  const [copiedLink, setCopiedLink] = useState(null);

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const response = await api.get('/professional/shared-progress');
      setShares(response.data.shares || []);
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  };

  const handleCreateShare = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/professional/share-progress', {
        therapistId,
        ...shareData
      });
      
      if (response.data.success) {
        alert('Progress shared successfully!');
        setShowCreate(false);
        fetchShares();
        copyToClipboard(response.data.shareLink);
      }
    } catch (error) {
      console.error('Error creating share:', error);
      alert('Failed to share progress');
    }
  };

  const handleRevokeShare = async (id) => {
    if (!confirm('Are you sure you want to revoke this share?')) return;

    try {
      await api.patch(`/professional/shared-progress/${id}/revoke`, {
        reason: 'User revoked access'
      });
      fetchShares();
      alert('Share revoked successfully');
    } catch (error) {
      console.error('Error revoking share:', error);
      alert('Failed to revoke share');
    }
  };

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const dataTypeOptions = [
    { value: 'mood', label: 'Mood Tracking' },
    { value: 'journal', label: 'Journal Entries' },
    { value: 'goals', label: 'Goals & Habits' },
    { value: 'wellness', label: 'Wellness Activities' },
    { value: 'cbt', label: 'CBT Tools' },
    { value: 'analytics', label: 'Analytics & Insights' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Share Progress</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Share2 className="w-4 h-4" />
          Create Share Link
        </button>
      </div>

      {/* Active Shares */}
      <div className="space-y-4">
        {shares.map((share) => (
          <div
            key={share._id}
            className="bg-white rounded-xl border-2 border-gray-200 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 mb-1">
                  {share.therapistId?.name || 'Therapist'}
                </h4>
                <p className="text-sm text-gray-600">
                  Created {new Date(share.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                share.status === 'active' ? 'bg-green-100 text-green-700' :
                share.status === 'expired' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {share.status.charAt(0).toUpperCase() + share.status.slice(1)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {share.dataTypes.map(type => (
                <span
                  key={type}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                >
                  {dataTypeOptions.find(opt => opt.value === type)?.label || type}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <Eye className="w-4 h-4" />
              <span>Viewed {share.viewCount} times</span>
              {share.lastViewedAt && (
                <span>• Last viewed {new Date(share.lastViewedAt).toLocaleDateString()}</span>
              )}
            </div>

            {share.status === 'active' && (
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/shared-progress/${share.accessToken}`)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
                >
                  {copiedLink === `${window.location.origin}/shared-progress/${share.accessToken}` ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleRevokeShare(share._id)}
                  className="flex items-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                >
                  <EyeOff className="w-4 h-4" />
                  Revoke Access
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Share Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Share Progress</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShare} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sharing with: {therapistName}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data to Share
                </label>
                <div className="space-y-2">
                  {dataTypeOptions.map(option => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={shareData.dataTypes.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShareData({
                              ...shareData,
                              dataTypes: [...shareData.dataTypes, option.value]
                            });
                          } else {
                            setShareData({
                              ...shareData,
                              dataTypes: shareData.dataTypes.filter(t => t !== option.value)
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={shareData.dateRange.start}
                    onChange={(e) => setShareData({
                      ...shareData,
                      dateRange: { ...shareData.dateRange, start: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="date"
                    value={shareData.dateRange.end}
                    onChange={(e) => setShareData({
                      ...shareData,
                      dateRange: { ...shareData.dateRange, end: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Duration
                </label>
                <select
                  value={shareData.expiresIn}
                  onChange={(e) => setShareData({ ...shareData, expiresIn: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="">No expiration</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Create Share Link
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ProgressShare;
