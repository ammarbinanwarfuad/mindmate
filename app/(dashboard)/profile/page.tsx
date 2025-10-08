'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

interface ProfileData {
  name: string;
  university: string;
  year: number;
  bio?: string;
  preferences: {
    notifications: boolean;
    publicProfile: boolean;
    shareData: boolean;
  };
  privacy: {
    showInMatching: boolean;
    allowMessages: 'everyone' | 'matches' | 'none';
  };
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security'>('profile');

  const { register, handleSubmit, setValue } = useForm<ProfileData>();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      setValue('name', data.profile.name);
      setValue('university', data.profile.university);
      setValue('year', data.profile.year);
      setValue('bio', data.profile.bio);
      setValue('preferences', data.preferences);
      setValue('privacy', data.privacy);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const onSubmit = async (data: ProfileData) => {
    setLoading(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        await update({ name: data.name });
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;

    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-medium">Profile updated successfully!</p>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'privacy'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'security'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Security
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                <input
                  {...register('university')}
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Study
                </label>
                <select
                  {...register('year', { valueAsNumber: true })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                  <option value={5}>5th Year</option>
                  <option value={6}>Graduate</option>
                  <option value={7}>PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="Share a bit about yourself..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    {...register('preferences.notifications')}
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Enable notifications</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    {...register('preferences.publicProfile')}
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Make profile public</span>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    {...register('preferences.shareData')}
                    type="checkbox"
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700">Share anonymous data for research</span>
                </label>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      {...register('privacy.showInMatching')}
                      type="checkbox"
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded"
                    />
                    <div>
                      <p className="text-gray-700 font-medium">Show in peer matching</p>
                      <p className="text-sm text-gray-500">
                        Allow other students to find you for peer support
                      </p>
                    </div>
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who can message you?
                    </label>
                    <select
                      {...register('privacy.allowMessages')}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="matches">Only my matches</option>
                      <option value="none">No one</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Your Data</h4>
                <p className="text-sm text-blue-800 mb-4">
                  All journal entries are encrypted end-to-end. Your conversations with MindMate
                  are private and never shared.
                </p>
                <button
                  type="button"
                  className="text-blue-700 font-medium hover:underline text-sm"
                >
                  Download your data
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
                
                <button
                  type="button"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors text-left"
                >
                  <p className="font-medium text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-500">Update your password regularly</p>
                </button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-4">Danger Zone</h4>
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="w-full px-4 py-3 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors text-left"
                >
                  <p className="font-medium text-red-900">Delete Account</p>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all data
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Save Button */}
          {activeTab !== 'security' && (
            <div className="pt-6 border-t mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}