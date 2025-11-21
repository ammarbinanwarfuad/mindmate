import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import api from '../utils/api';
import { format } from 'date-fns';

const MoodTracker = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    moodScore: 5,
    emoji: '😐',
    journalEntry: '',
    triggers: [],
    activities: [],
    sleepHours: ''
  });

  const moodEmojis = [
    { score: 1, emoji: '😢', label: 'Terrible' },
    { score: 2, emoji: '😞', label: 'Bad' },
    { score: 3, emoji: '😕', label: 'Poor' },
    { score: 4, emoji: '😐', label: 'Below Average' },
    { score: 5, emoji: '🙂', label: 'Okay' },
    { score: 6, emoji: '😊', label: 'Good' },
    { score: 7, emoji: '😄', label: 'Great' },
    { score: 8, emoji: '😁', label: 'Very Good' },
    { score: 9, emoji: '🤩', label: 'Excellent' },
    { score: 10, emoji: '🥳', label: 'Amazing' }
  ];

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await api.get('/mood?limit=30');
      setEntries(response.data.entries);
    } catch (error) {
      console.error('Error fetching mood entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/mood', newEntry);
      setShowModal(false);
      setNewEntry({
        moodScore: 5,
        emoji: '😐',
        journalEntry: '',
        triggers: [],
        activities: [],
        sleepHours: ''
      });
      fetchEntries();
    } catch (error) {
      console.error('Error creating mood entry:', error);
    }
  };

  const handleMoodSelect = (score, emoji) => {
    setNewEntry({ ...newEntry, moodScore: score, emoji });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mood Tracker</h1>
            <p className="text-xl text-gray-600">Track and understand your emotional patterns</p>
          </div>
          <div className="flex gap-3">
            <Link to="/mood-analytics">
              <Button variant="outline">
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </Button>
            </Link>
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-5 h-5" />
              Log Mood
            </Button>
          </div>
        </div>

        {/* Mood Entries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {entries.length === 0 ? (
            <Card className="lg:col-span-2 text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No mood entries yet</h3>
              <p className="text-gray-600 mb-6">Start tracking your mood to see patterns and insights</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-5 h-5" />
                Log Your First Mood
              </Button>
            </Card>
          ) : (
            entries.map((entry) => (
              <Card key={entry._id} hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{entry.emoji}</span>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        Mood: {entry.moodScore}/10
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(entry.date), 'MMM dd, yyyy • h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                {entry.journalEntry?.decrypted && (
                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {entry.journalEntry.decrypted}
                  </p>
                )}

                {entry.triggers && entry.triggers.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">Triggers:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.triggers.map((trigger, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
                          {trigger}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.activities && entry.activities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Activities:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.activities.map((activity, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {entry.aiInsights && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>AI Insight:</strong> {entry.aiInsights}
                    </p>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Add Mood Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Log Your Mood"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                How are you feeling?
              </label>
              <div className="grid grid-cols-5 gap-3">
                {moodEmojis.map((mood) => (
                  <button
                    key={mood.score}
                    type="button"
                    onClick={() => handleMoodSelect(mood.score, mood.emoji)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      newEntry.moodScore === mood.score
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="text-3xl mb-1">{mood.emoji}</div>
                    <div className="text-xs text-gray-600">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal Entry (Optional)
              </label>
              <textarea
                value={newEntry.journalEntry}
                onChange={(e) => setNewEntry({ ...newEntry, journalEntry: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="What's on your mind?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Hours (Optional)
              </label>
              <input
                type="number"
                value={newEntry.sleepHours}
                onChange={(e) => setNewEntry({ ...newEntry, sleepHours: e.target.value })}
                min="0"
                max="24"
                step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="7.5"
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" fullWidth>
                Save Mood Entry
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default MoodTracker;
