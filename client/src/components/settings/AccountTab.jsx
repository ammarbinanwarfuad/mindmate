import { Mail, Calendar, LogOut, Trash2, Save } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function AccountTab({ 
  user, 
  settings, 
  setSettings, 
  saving,
  handleSettingsSave,
  handleLogout,
  setShowDeleteModal 
}) {
  return (
    <>
      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Mail className="w-5 h-5 text-gray-400" />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Account Created</p>
              <p className="text-sm text-gray-600">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Enable Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications about activity</p>
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
              <p className="font-medium text-gray-900">Public Profile</p>
              <p className="text-sm text-gray-600">Make your profile visible to everyone</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.preferences?.publicProfile}
              onChange={(e) => setSettings({
                ...settings,
                preferences: { ...settings.preferences, publicProfile: e.target.checked }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Share Data</p>
              <p className="text-sm text-gray-600">Help improve MindMate with usage data</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.preferences?.shareData}
              onChange={(e) => setSettings({
                ...settings,
                preferences: { ...settings.preferences, shareData: e.target.checked }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSettingsSave} fullWidth disabled={saving}>
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-red-600">Danger Zone</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Log Out</p>
                <p className="text-sm text-gray-600">Sign out of your account</p>
              </div>
              <Button onClick={handleLogout} variant="secondary">
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </div>

          <div className="p-4 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-900">Delete Account</p>
                <p className="text-sm text-red-700">Permanently delete your account and all data</p>
              </div>
              <Button 
                onClick={() => setShowDeleteModal(true)} 
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
