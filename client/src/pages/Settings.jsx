import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Bell, Shield, User, AlertCircle, Check, Camera,
  Settings as SettingsIcon
} from 'lucide-react';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ProfileTab from '../components/settings/ProfileTab';
import AccountTab from '../components/settings/AccountTab';
import PrivacyTab from '../components/settings/PrivacyTab';
import NotificationsTab from '../components/settings/NotificationsTab';
import PhotosTab from '../components/settings/PhotosTab';

const Settings = () => {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [photoHistory, setPhotoHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    headline: '',
    university: '',
    year: '',
    bio: '',
    about: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/user/profile');
      const userData = response.data;
      
      setProfile(userData.profile || {});
      setSettings({
        preferences: userData.preferences || {},
        privacy: userData.privacy || {}
      });
      setPhotoHistory(userData.photoHistory || []);
      
      setFormData({
        name: userData.profile?.name || '',
        headline: userData.profile?.headline || '',
        university: userData.profile?.university || '',
        year: userData.profile?.year || '',
        bio: userData.profile?.bio || '',
        about: userData.profile?.about || ''
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrorMessage('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/user/profile', { profile: formData });
      setSuccessMessage('Profile updated successfully!');
      await fetchSettings();
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    try {
      await api.patch('/user/profile', settings);
      setSuccessMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload an image file');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('Uploading image...', { fileName: file.name, fileSize: file.size, fileType: file.type });
      
      const response = await api.post(`/upload?type=${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Upload failed');
      }
      
      const imageUrl = response.data.url;
      const updateData = {
        profile: {
          ...profile,
          [type]: imageUrl
        }
      };
      
      await api.patch('/user/profile', updateData);
      setSuccessMessage(`${type === 'profilePicture' ? 'Profile picture' : 'Cover photo'} updated successfully!`);
      await fetchSettings();
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload image';
      setErrorMessage(`Failed to upload image: ${errorMsg}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/user/profile');
      await logout();
    } catch (error) {
      console.error('Error deleting account:', error);
      setErrorMessage('Failed to delete account');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: SettingsIcon },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'photos', label: 'Photos', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-xl text-gray-600">Manage your account, profile, and preferences</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <ProfileTab
                profile={profile}
                formData={formData}
                setFormData={setFormData}
                user={user}
                uploading={uploading}
                saving={saving}
                handleImageUpload={handleImageUpload}
                handleProfileUpdate={handleProfileUpdate}
              />
            )}

            {activeTab === 'account' && (
              <AccountTab
                user={user}
                settings={settings}
                setSettings={setSettings}
                saving={saving}
                handleSettingsSave={handleSettingsSave}
                handleLogout={handleLogout}
                setShowDeleteModal={setShowDeleteModal}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyTab
                settings={settings}
                setSettings={setSettings}
                saving={saving}
                handleSettingsSave={handleSettingsSave}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                settings={settings}
                setSettings={setSettings}
                saving={saving}
                handleSettingsSave={handleSettingsSave}
              />
            )}

            {activeTab === 'photos' && (
              <PhotosTab
                profile={profile}
                photoHistory={photoHistory}
                fetchSettings={fetchSettings}
              />
            )}
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Account"
          >
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Settings;
