import { Shield, BarChart3, Save } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function PrivacyTab({ settings, setSettings, saving, handleSettingsSave }) {
  return (
    <>
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Privacy Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Profile Visibility</p>
              <p className="text-sm text-gray-600">Make your profile public</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.privacy?.visibility?.profilePublic}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  visibility: { ...settings.privacy?.visibility, profilePublic: e.target.checked }
                }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Show in Matching</p>
              <p className="text-sm text-gray-600">Allow others to find you as a match</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.privacy?.visibility?.showInMatching}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  visibility: { ...settings.privacy?.visibility, showInMatching: e.target.checked }
                }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Show Active Status</p>
              <p className="text-sm text-gray-600">Let others see when you're online</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.privacy?.showActiveStatus}
              onChange={(e) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, showActiveStatus: e.target.checked }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div className="py-3">
            <div className="mb-3">
              <p className="font-medium text-gray-900">Who can message you?</p>
              <p className="text-sm text-gray-600">Control who can send you messages</p>
            </div>
            <select
              value={settings?.privacy?.visibility?.allowMessages || 'matches'}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  visibility: { ...settings.privacy?.visibility, allowMessages: e.target.value }
                }
              })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="everyone">Everyone</option>
              <option value="matches">Matches Only</option>
              <option value="none">No One</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-gray-900">Data & Analytics</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Allow Analytics</p>
              <p className="text-sm text-gray-600">Help us improve with anonymous usage data</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.privacy?.dataCollection?.allowAnalytics}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  dataCollection: { ...settings.privacy?.dataCollection, allowAnalytics: e.target.checked }
                }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div>
              <p className="font-medium text-gray-900">Allow Research</p>
              <p className="text-sm text-gray-600">Contribute to mental health research</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.privacy?.dataCollection?.allowResearch}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  dataCollection: { ...settings.privacy?.dataCollection, allowResearch: e.target.checked }
                }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-gray-900">Allow Personalization</p>
              <p className="text-sm text-gray-600">Use your data to personalize experience</p>
            </div>
            <input
              type="checkbox"
              checked={settings?.privacy?.dataCollection?.allowPersonalization}
              onChange={(e) => setSettings({
                ...settings,
                privacy: {
                  ...settings.privacy,
                  dataCollection: { ...settings.privacy?.dataCollection, allowPersonalization: e.target.checked }
                }
              })}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSettingsSave} fullWidth disabled={saving}>
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </div>
      </Card>
    </>
  );
}
