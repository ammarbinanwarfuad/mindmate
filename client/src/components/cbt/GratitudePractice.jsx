import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import useGamificationTracking from '../../hooks/useGamificationTracking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const GratitudePractice = () => {
  const { track } = useGamificationTracking();
  const [entries, setEntries] = useState([]);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [formData, setFormData] = useState({
    entries: [
      { text: '', category: 'people' },
      { text: '', category: 'experiences' },
      { text: '', category: 'things' }
    ],
    mood: 7,
    reflection: ''
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'people', label: '👥 People', emoji: '👥' },
    { value: 'experiences', label: '✨ Experiences', emoji: '✨' },
    { value: 'things', label: '🎁 Things', emoji: '🎁' },
    { value: 'opportunities', label: '🚪 Opportunities', emoji: '🚪' },
    { value: 'health', label: '💪 Health', emoji: '💪' },
    { value: 'nature', label: '🌿 Nature', emoji: '🌿' },
    { value: 'achievements', label: '🏆 Achievements', emoji: '🏆' },
    { value: 'other', label: '💭 Other', emoji: '💭' }
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/cbt/gratitude`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(response.data.entries);
      setCurrentStreak(response.data.currentStreak);
    } catch (error) {
      console.error('Error fetching gratitude entries:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/cbt/gratitude`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await track('gratitude_journal', 15);
      setFormData({
        entries: [
          { text: '', category: 'people' },
          { text: '', category: 'experiences' },
          { text: '', category: 'things' }
        ],
        mood: 7,
        reflection: ''
      });
      fetchEntries();
    } catch (error) {
      console.error('Error saving gratitude entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = () => {
    setFormData({
      ...formData,
      entries: [...formData.entries, { text: '', category: 'other' }]
    });
  };

  return (
    <div className="space-y-6">
      {/* Streak Display */}
      <div className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-xl p-6 text-center">
        <div className="text-5xl mb-2">🔥</div>
        <h3 className="text-2xl font-bold">{currentStreak} Day Streak!</h3>
        <p className="text-pink-100">Keep the gratitude flowing</p>
      </div>

      {/* Today's Gratitude */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-xl font-bold text-gray-900">Today I'm grateful for...</h3>
        
        {formData.entries.map((entry, index) => (
          <div key={index} className="space-y-2">
            <div className="flex gap-2">
              <select
                value={entry.category}
                onChange={(e) => {
                  const newEntries = [...formData.entries];
                  newEntries[index].category = e.target.value;
                  setFormData({ ...formData, entries: newEntries });
                }}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={entry.text}
                onChange={(e) => {
                  const newEntries = [...formData.entries];
                  newEntries[index].text = e.target.value;
                  setFormData({ ...formData, entries: newEntries });
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="What are you grateful for?"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addEntry}
          className="text-pink-600 hover:text-pink-700 font-medium"
        >
          + Add Another
        </button>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            How do you feel right now? ({formData.mood}/10)
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={formData.mood}
            onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>😢 Low</span>
            <span>😊 Great</span>
          </div>
        </div>

        <textarea
          value={formData.reflection}
          onChange={(e) => setFormData({ ...formData, reflection: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          rows="3"
          placeholder="Any reflections on today? (optional)"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-lg hover:from-pink-700 hover:to-orange-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Today\'s Gratitude'}
        </button>
      </form>

      {/* Past Entries */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-900">Past Entries</h3>
        {entries.slice(0, 5).map((entry) => (
          <motion.div
            key={entry._id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border border-gray-200 rounded-lg p-4"
          >
            <p className="text-sm text-gray-500 mb-2">
              {new Date(entry.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <ul className="space-y-1">
              {entry.entries.map((item, index) => {
                const category = categories.find(c => c.value === item.category);
                return (
                  <li key={index} className="flex items-start gap-2">
                    <span>{category?.emoji || '💭'}</span>
                    <span className="text-gray-700">{item.text}</span>
                  </li>
                );
              })}
            </ul>
            {entry.reflection && (
              <p className="text-sm text-gray-600 mt-2 italic">{entry.reflection}</p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GratitudePractice;
