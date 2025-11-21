import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useGamificationTracking from '../../hooks/useGamificationTracking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BehavioralActivationPlanner = () => {
  const { track } = useGamificationTracking();
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    activity: '',
    category: 'achievement',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '',
    duration: 30,
    predictedEnjoyment: 5,
    predictedAccomplishment: 5,
    predictedDifficulty: 5,
    moodBefore: 5
  });

  const categories = [
    { value: 'achievement', label: '🎯 Achievement', color: 'bg-blue-100 text-blue-800' },
    { value: 'social', label: '👥 Social', color: 'bg-green-100 text-green-800' },
    { value: 'pleasure', label: '😊 Pleasure', color: 'bg-pink-100 text-pink-800' },
    { value: 'exercise', label: '💪 Exercise', color: 'bg-orange-100 text-orange-800' },
    { value: 'self-care', label: '🧘 Self-Care', color: 'bg-purple-100 text-purple-800' },
    { value: 'creative', label: '🎨 Creative', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'learning', label: '📚 Learning', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'routine', label: '📅 Routine', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cbt/behavioral-activations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/cbt/behavioral-activation`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await track('goal_created', 10);
      setShowForm(false);
      setFormData({
        activity: '',
        category: 'achievement',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '',
        duration: 30,
        predictedEnjoyment: 5,
        predictedAccomplishment: 5,
        predictedDifficulty: 5,
        moodBefore: 5
      });
      fetchActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  };

  const completeActivity = async (id) => {
    const actualEnjoyment = prompt('How much did you enjoy it? (0-10)');
    const actualAccomplishment = prompt('How accomplished do you feel? (0-10)');
    const moodAfter = prompt('What\'s your mood now? (0-10)');
    
    if (actualEnjoyment && actualAccomplishment && moodAfter) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(
          `${API_URL}/cbt/behavioral-activation/${id}/complete`,
          {
            actualEnjoyment: parseInt(actualEnjoyment),
            actualAccomplishment: parseInt(actualAccomplishment),
            actualDifficulty: 5,
            moodAfter: parseInt(moodAfter)
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await track('goal_completed', 30);
        fetchActivities();
      } catch (error) {
        console.error('Error completing activity:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700"
      >
        {showForm ? 'Cancel' : '+ Plan New Activity'}
      </button>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          onSubmit={handleSubmit}
          className="bg-gray-50 rounded-lg p-6 space-y-4"
        >
          <input
            type="text"
            value={formData.activity}
            onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="What activity do you want to do?"
            required
          />
          
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
            <input
              type="time"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Duration (minutes): {formData.duration}</label>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Schedule Activity
          </button>
        </motion.form>
      )}

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Planned Activities</h3>
        {activities.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No activities planned yet. Start by adding one!</p>
        ) : (
          activities.map((activity) => {
            const category = categories.find(c => c.value === activity.category);
            return (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`bg-white border-2 rounded-lg p-4 ${activity.completed ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${category?.color}`}>
                        {category?.label}
                      </span>
                      {activity.completed && <span className="text-2xl">✅</span>}
                    </div>
                    <h4 className="font-semibold text-gray-900">{activity.activity}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(activity.scheduledDate).toLocaleDateString()} 
                      {activity.scheduledTime && ` at ${activity.scheduledTime}`}
                      {activity.duration && ` • ${activity.duration} min`}
                    </p>
                  </div>
                  {!activity.completed && (
                    <button
                      onClick={() => completeActivity(activity._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BehavioralActivationPlanner;
