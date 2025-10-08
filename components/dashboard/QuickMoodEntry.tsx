'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const QUICK_MOODS = [
  { score: 10, emoji: '🥳', label: 'Amazing' },
  { score: 8, emoji: '😄', label: 'Great' },
  { score: 6, emoji: '🙂', label: 'Good' },
  { score: 4, emoji: '😐', label: 'Okay' },
  { score: 2, emoji: '😟', label: 'Bad' },
];

export default function QuickMoodEntry() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logQuickMood = async (score: number, emoji: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/mood/entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moodScore: score,
          emoji,
          triggers: [],
          activities: [],
        }),
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to log mood:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Mood Check</h3>
      <p className="text-sm text-gray-600 mb-4">How are you feeling right now?</p>
      
      <div className="grid grid-cols-5 gap-2">
        {QUICK_MOODS.map((mood) => (
          <button
            key={mood.score}
            onClick={() => logQuickMood(mood.score, mood.emoji)}
            disabled={loading}
            className="flex flex-col items-center p-3 rounded-lg border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all disabled:opacity-50"
          >
            <span className="text-3xl mb-1">{mood.emoji}</span>
            <span className="text-xs text-gray-600">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}