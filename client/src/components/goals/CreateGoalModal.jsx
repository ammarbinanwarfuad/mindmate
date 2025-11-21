import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import api from '../../utils/api';

const CreateGoalModal = ({ onClose, onGoalCreated, suggestion = null }) => {
  const [formData, setFormData] = useState({
    title: suggestion?.title || '',
    description: suggestion?.description || '',
    type: suggestion?.type || 'custom',
    frequency: suggestion?.frequency || 'daily',
    target: suggestion?.target || 30,
    icon: suggestion?.icon || '🎯',
    color: suggestion?.color || '#8b5cf6',
    reminderEnabled: false,
    reminderTime: '09:00',
    reminderDays: [1, 2, 3, 4, 5] // Monday to Friday
  });

  const [loading, setLoading] = useState(false);

  const goalTypes = [
    { value: 'meditation', label: 'Meditation', icon: '🧘' },
    { value: 'mood', label: 'Mood Tracking', icon: '😊' },
    { value: 'social', label: 'Social Connection', icon: '💬' },
    { value: 'wellness', label: 'Wellness', icon: '✨' },
    { value: 'journal', label: 'Journaling', icon: '📝' },
    { value: 'custom', label: 'Custom', icon: '🎯' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const colors = [
    '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'
  ];

  const icons = ['🎯', '⭐', '🔥', '💪', '🌟', '✨', '🚀', '💎', '🏆', '🎨'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/goals', formData);
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary-500 to-secondary-600 text-white p-8 rounded-t-2xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-3xl font-bold mb-2">Create New Goal</h2>
            <p className="text-primary-100">Set a goal and track your progress</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Title */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Goal Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Meditate daily"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="What do you want to achieve?"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Goal Type *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {goalTypes.map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('type', type.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Frequency and Target */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => handleChange('frequency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  {frequencies.map(freq => (
                    <option key={freq.value} value={freq.value}>
                      {freq.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Target *
                </label>
                <input
                  type="number"
                  value={formData.target}
                  onChange={(e) => handleChange('target', parseInt(e.target.value))}
                  min="1"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-500 mt-1">Number of completions</p>
              </div>
            </div>

            {/* Icon */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {icons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => handleChange('icon', icon)}
                    className={`w-12 h-12 rounded-lg border-2 text-2xl transition-all ${
                      formData.icon === icon
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange('color', color)}
                    className={`w-10 h-10 rounded-lg transition-all ${
                      formData.color === color
                        ? 'ring-4 ring-offset-2 ring-gray-400'
                        : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Reminders */}
            <div className="mb-6">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={formData.reminderEnabled}
                  onChange={(e) => handleChange('reminderEnabled', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-semibold text-gray-700">
                  Enable Reminders
                </span>
              </label>

              {formData.reminderEnabled && (
                <div className="ml-6 space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.reminderTime}
                      onChange={(e) => handleChange('reminderTime', e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Days</label>
                    <div className="flex gap-2">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const days = formData.reminderDays.includes(index)
                              ? formData.reminderDays.filter(d => d !== index)
                              : [...formData.reminderDays, index];
                            handleChange('reminderDays', days);
                          }}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            formData.reminderDays.includes(index)
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateGoalModal;
