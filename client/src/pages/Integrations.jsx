import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Activity, Music, Moon, Chrome, RefreshCw, Check, X, Settings } from 'lucide-react';
import api from '../utils/api';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await api.get('/integrations');
      setIntegrations(response.data.integrations || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider) => {
    try {
      // Simulate OAuth flow
      const mockToken = `mock_token_${Date.now()}`;
      await api.post('/integrations/connect', {
        provider,
        accessToken: mockToken,
        refreshToken: `refresh_${mockToken}`,
        tokenExpiry: new Date(Date.now() + 3600000), // 1 hour
        providerUserId: `user_${Date.now()}`,
        metadata: { connected: true }
      });
      
      alert(`${provider} connected successfully!`);
      fetchIntegrations();
    } catch (error) {
      console.error('Error connecting:', error);
      alert('Failed to connect integration');
    }
  };

  const handleDisconnect = async (provider) => {
    if (!confirm(`Disconnect ${provider}?`)) return;
    
    try {
      await api.delete(`/integrations/${provider}`);
      alert('Integration disconnected');
      fetchIntegrations();
    } catch (error) {
      console.error('Error disconnecting:', error);
      alert('Failed to disconnect');
    }
  };

  const handleSync = async (provider) => {
    try {
      setSyncing(provider);
      await api.post(`/integrations/${provider}/sync`);
      alert('Sync completed successfully!');
      fetchIntegrations();
    } catch (error) {
      console.error('Error syncing:', error);
      alert(error.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  const availableIntegrations = [
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Sync your appointments and reminders',
      icon: Calendar,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      features: ['Event sync', 'Reminder notifications', 'Two-way sync']
    },
    {
      id: 'outlook',
      name: 'Outlook Calendar',
      description: 'Connect your Microsoft calendar',
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      features: ['Calendar sync', 'Task integration', 'Meeting reminders']
    },
    {
      id: 'fitbit',
      name: 'Fitbit',
      description: 'Track your physical activity and health',
      icon: Activity,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      features: ['Steps tracking', 'Heart rate', 'Sleep data', 'Activity logs']
    },
    {
      id: 'apple-health',
      name: 'Apple Health',
      description: 'Import health and fitness data',
      icon: Activity,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      features: ['Health metrics', 'Workout data', 'Mindfulness minutes']
    },
    {
      id: 'spotify',
      name: 'Spotify',
      description: 'Get mood-based music recommendations',
      icon: Music,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      features: ['Mood playlists', 'Listening history', 'Personalized recommendations']
    },
    {
      id: 'sleep-tracker',
      name: 'Sleep Tracker',
      description: 'Monitor your sleep patterns',
      icon: Moon,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      features: ['Sleep duration', 'Sleep quality', 'Sleep stages', 'Insights']
    }
  ];

  const getIntegrationStatus = (providerId) => {
    return integrations.find(i => i.provider === providerId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔗 Integrations
          </h1>
          <p className="text-gray-600">
            Connect your favorite apps and services
          </p>
        </div>

        {/* Browser Extension Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 mb-8 text-white">
          <div className="flex items-start gap-4">
            <Chrome className="w-12 h-12 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">MindMate Browser Extension</h3>
              <p className="mb-4 opacity-90">
                Track your mood and access quick relief tools directly from your browser. 
                Get gentle reminders throughout the day.
              </p>
              <div className="flex gap-3">
                <button className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-medium">
                  Add to Chrome
                </button>
                <button className="px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 font-medium">
                  Add to Firefox
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading integrations...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableIntegrations.map((integration, index) => {
              const Icon = integration.icon;
              const status = getIntegrationStatus(integration.id);
              const isConnected = !!status;

              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl border-2 ${
                    isConnected ? 'border-green-300' : 'border-gray-200'
                  } p-6 hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${integration.bgColor} rounded-xl`}>
                      <Icon className="w-8 h-8 text-gray-700" />
                    </div>
                    {isConnected && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Connected
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {integration.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {integration.description}
                  </p>

                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Features:</p>
                    <ul className="space-y-1">
                      {integration.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="text-green-600">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {status && status.settings?.lastSync && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600">
                        Last synced: {new Date(status.settings.lastSync).toLocaleString()}
                      </p>
                      {status.syncHistory.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                          {status.syncHistory[status.syncHistory.length - 1].itemsSynced} items synced
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => handleSync(integration.id)}
                          disabled={syncing === integration.id}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <RefreshCw className={`w-4 h-4 ${syncing === integration.id ? 'animate-spin' : ''}`} />
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleConnect(integration.id)}
                        className={`w-full px-4 py-2 bg-gradient-to-r ${integration.color} text-white rounded-lg hover:shadow-lg transition-all font-medium`}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">Why Connect Integrations?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <div className="font-semibold mb-1">📊 Better Insights</div>
              <p>Get a complete picture of your mental and physical health</p>
            </div>
            <div>
              <div className="font-semibold mb-1">⚡ Automatic Tracking</div>
              <p>No manual entry needed - data syncs automatically</p>
            </div>
            <div>
              <div className="font-semibold mb-1">🔒 Secure & Private</div>
              <p>Your data is encrypted and never shared without permission</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;
