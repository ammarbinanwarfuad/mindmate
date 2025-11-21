import { Bell, Save } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function NotificationsTab({ settings, setSettings, saving, handleSettingsSave }) {
  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Notification Preferences</h2>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Push Notifications</p>
            <p className="text-sm text-gray-600">Receive push notifications on your device</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.preferences?.notifications}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, notifications: e.target.checked }
            })}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-200">
          <div>
            <p className="font-medium text-gray-900">Email Notifications</p>
            <p className="text-sm text-gray-600">Receive updates via email</p>
          </div>
          <input
            type="checkbox"
            checked={settings?.preferences?.emailNotifications}
            onChange={(e) => setSettings({
              ...settings,
              preferences: { ...settings.preferences, emailNotifications: e.target.checked }
            })}
            className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
        </div>

        <div className="py-3">
          <p className="font-medium text-gray-900 mb-4">Notify me about:</p>
          <div className="space-y-3 ml-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings?.preferences?.notifyMatches}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, notifyMatches: e.target.checked }
                })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">New matches</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings?.preferences?.notifyMessages}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, notifyMessages: e.target.checked }
                })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">New messages</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings?.preferences?.notifyCommunity}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, notifyCommunity: e.target.checked }
                })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Community posts and replies</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings?.preferences?.notifyReminders}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, notifyReminders: e.target.checked }
                })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Mood tracking reminders</span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings?.preferences?.notifyUpdates}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, notifyUpdates: e.target.checked }
                })}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Product updates and news</span>
            </label>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Button onClick={handleSettingsSave} fullWidth disabled={saving}>
          <Save className="w-5 h-5" />
          {saving ? 'Saving...' : 'Save Notification Settings'}
        </Button>
      </div>
    </Card>
  );
}
