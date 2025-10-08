'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const MOOD_OPTIONS = [
  { score: 1, emoji: '😢', label: 'Terrible' },
  { score: 2, emoji: '😟', label: 'Bad' },
  { score: 3, emoji: '😕', label: 'Poor' },
  { score: 4, emoji: '😐', label: 'Okay' },
  { score: 5, emoji: '🙂', label: 'Fair' },
  { score: 6, emoji: '😊', label: 'Good' },
  { score: 7, emoji: '😄', label: 'Great' },
  { score: 8, emoji: '😁', label: 'Very Good' },
  { score: 9, emoji: '🤩', label: 'Excellent' },
  { score: 10, emoji: '🥳', label: 'Amazing' },
];

const TRIGGER_OPTIONS = [
  'Academic stress', 'Financial worries', 'Social isolation',
  'Family issues', 'Health concerns', 'Sleep problems',
  'Relationship issues', 'Work stress', 'Other'
];

const ACTIVITY_OPTIONS = [
  'Exercise', 'Meditation', 'Socializing', 'Reading',
  'Hobbies', 'Self-care', 'Therapy', 'Journaling'
];

export default function NewMoodEntry() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [loading, setLoading] = useState(false);

  const toggleSelection = (item: string, list: string[], setter: (list: string[]) => void) => {
    if (list.includes(item)) {
      setter(list.filter(i => i !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMood === null) {
      alert('Please select your mood');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/mood/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodScore: selectedMood,
          emoji: MOOD_OPTIONS.find(m => m.score === selectedMood)?.emoji,
          journalEntry: journalEntry || undefined,
          triggers: selectedTriggers,
          activities: selectedActivities,
          sleepHours
        })
      });

      if (response.ok) {
        router.push('/mood');
      } else {
        alert('Failed to save mood entry');
      }
    } catch (error) {
      console.error('Error saving mood:', error);
      alert('Failed to save mood entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">How are you feeling today?</h1>
        <p className="text-gray-600 mb-8">Take a moment to check in with yourself</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Mood Selection */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Your Mood
            </label>
            <div className="grid grid-cols-5 gap-3">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.score}
                  type="button"
                  onClick={() => setSelectedMood(mood.score)}
                  className={`
                    flex flex-col items-center p-4 rounded-xl border-2 transition-all
                    ${selectedMood === mood.score 
                      ? 'border-purple-600 bg-purple-50 shadow-md scale-105' 
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }
                  `}
                >
                  <span className="text-4xl mb-2">{mood.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{mood.score}</span>
                  <span className="text-xs text-gray-500">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Journal Entry */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Journal Entry (Optional)
            </label>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="What's on your mind? Your thoughts are private and encrypted..."
              className="w-full h-40 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
            />
            <p className="text-sm text-gray-500 mt-2">
              🔒 Your journal is encrypted and completely private
            </p>
          </div>

          {/* Triggers */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Any triggers today?
            </label>
            <div className="flex flex-wrap gap-2">
              {TRIGGER_OPTIONS.map(trigger => (
                <button
                  key={trigger}
                  type="button"
                  onClick={() => toggleSelection(trigger, selectedTriggers, setSelectedTriggers)}
                  className={`
                    px-4 py-2 rounded-full border-2 transition-all text-sm font-medium
                    ${selectedTriggers.includes(trigger)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }
                  `}
                >
                  {trigger}
                </button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              What helped today?
            </label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_OPTIONS.map(activity => (
                <button
                  key={activity}
                  type="button"
                  onClick={() => toggleSelection(activity, selectedActivities, setSelectedActivities)}
                  className={`
                    px-4 py-2 rounded-full border-2 transition-all text-sm font-medium
                    ${selectedActivities.includes(activity)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-green-300'
                    }
                  `}
                >
                  {activity}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep Hours */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Hours of Sleep: {sleepHours}h
            </label>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={sleepHours}
              onChange={(e) => setSleepHours(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>0h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={selectedMood === null || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Mood Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}