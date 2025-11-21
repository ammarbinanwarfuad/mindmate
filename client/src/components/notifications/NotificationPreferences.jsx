import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import QuietHoursSelector from './QuietHoursSelector';
import TimeSelector from './TimeSelector';

const NotificationPreferences = ({ onNotificationSent }) => {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setError(null);
      const response = await api.get('/notifications/schedule');
      console.log('Schedule response:', response.data);
      setSchedule(response.data.schedule || response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      setError(error.response?.data?.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async (updates) => {
    try {
      setSaving(true);
      setError(null);
      const response = await api.post('/notifications/schedule', updates);
      setSchedule(response.data.schedule || response.data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await api.post('/notifications/test');
      console.log('Test notification response:', response.data);
      if (response.data.success) {
        alert('✅ Test notification sent! Switch to Notifications tab to see it.');
        // Trigger callback to reload notifications
        if (onNotificationSent) {
          onNotificationSent();
        }
      } else {
        alert('❌ Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      console.error('Error details:', error.response?.data);
      alert(`❌ Failed to send test notification: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading preferences...</p>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to load preferences</h3>
        <p className="text-gray-600 mb-4">{error || 'Please try again later'}</p>
        <button
          onClick={fetchSchedule}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg"
        >
          ✅ Preferences saved successfully!
        </motion.div>
      )}

      {/* Mood Reminders */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">😊 Mood Check-In Reminders</h3>
            <p className="text-sm text-gray-600">Get reminded to log your mood</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.moodReminders.enabled}
              onChange={(e) => updateSchedule({
                moodReminders: { ...schedule.moodReminders, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {schedule.moodReminders.enabled && (
          <div className="space-y-3">
            <select
              value={schedule.moodReminders.frequency}
              onChange={(e) => updateSchedule({
                moodReminders: { ...schedule.moodReminders, frequency: e.target.value }
              })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="once">Once daily</option>
              <option value="twice">Twice daily</option>
              <option value="thrice">Three times daily</option>
            </select>

            {schedule.moodReminders.times.map((time, index) => (
              <TimeSelector
                key={index}
                label={`Reminder ${index + 1}`}
                time={time}
                onChange={(newTime) => {
                  const newTimes = [...schedule.moodReminders.times];
                  newTimes[index] = newTime;
                  updateSchedule({
                    moodReminders: { ...schedule.moodReminders, times: newTimes }
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Goal Reminders */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">🎯 Goal Reminders</h3>
            <p className="text-sm text-gray-600">Daily reminder to work on your goals</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.goalReminders.enabled}
              onChange={(e) => updateSchedule({
                goalReminders: { ...schedule.goalReminders, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {schedule.goalReminders.enabled && (
          <TimeSelector
            time={schedule.goalReminders.time}
            onChange={(newTime) => updateSchedule({
              goalReminders: { ...schedule.goalReminders, time: newTime }
            })}
          />
        )}
      </div>

      {/* Wellness Reminders */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">🧘 Wellness Reminders</h3>
            <p className="text-sm text-gray-600">Reminder for wellness activities</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.wellnessReminders.enabled}
              onChange={(e) => updateSchedule({
                wellnessReminders: { ...schedule.wellnessReminders, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {schedule.wellnessReminders.enabled && (
          <TimeSelector
            time={schedule.wellnessReminders.time}
            onChange={(newTime) => updateSchedule({
              wellnessReminders: { ...schedule.wellnessReminders, time: newTime }
            })}
          />
        )}
      </div>

      {/* Journal Reminders */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">✍️ Journal Reminders</h3>
            <p className="text-sm text-gray-600">Daily reminder to journal</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.journalReminders.enabled}
              onChange={(e) => updateSchedule({
                journalReminders: { ...schedule.journalReminders, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {schedule.journalReminders.enabled && (
          <TimeSelector
            time={schedule.journalReminders.time}
            onChange={(newTime) => updateSchedule({
              journalReminders: { ...schedule.journalReminders, time: newTime }
            })}
          />
        )}
      </div>

      {/* Inactivity Reminders */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">💙 Inactivity Reminders</h3>
            <p className="text-sm text-gray-600">Get reminded if you haven't used the app</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={schedule.inactivityReminders.enabled}
              onChange={(e) => updateSchedule({
                inactivityReminders: { ...schedule.inactivityReminders, enabled: e.target.checked }
              })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {schedule.inactivityReminders.enabled && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Days of inactivity before reminder: {schedule.inactivityReminders.daysThreshold}
            </label>
            <input
              type="range"
              min="1"
              max="14"
              value={schedule.inactivityReminders.daysThreshold}
              onChange={(e) => updateSchedule({
                inactivityReminders: { ...schedule.inactivityReminders, daysThreshold: parseInt(e.target.value) }
              })}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <QuietHoursSelector
        quietHours={schedule.quietHours}
        onChange={(quietHours) => updateSchedule({ quietHours })}
      />

      {/* Test Notification */}
      <button
        onClick={sendTestNotification}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700"
      >
        🔔 Send Test Notification
      </button>
    </div>
  );
};

export default NotificationPreferences;
