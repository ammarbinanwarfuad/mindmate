'use client';

import { useState } from 'react';

const SLEEP_TIPS = [
  {
    category: 'Sleep Hygiene',
    icon: '🛏️',
    tips: [
      'Keep a consistent sleep schedule, even on weekends',
      'Create a relaxing bedtime routine (30-60 minutes before bed)',
      'Keep your bedroom cool, dark, and quiet',
      'Use your bed only for sleep (not studying or screen time)',
      'Avoid caffeine 6 hours before bedtime',
      'Limit alcohol and heavy meals before sleep',
    ],
  },
  {
    category: 'Wind-Down Routine',
    icon: '🌙',
    activities: [
      'Take a warm bath or shower',
      'Read a physical book (not on a screen)',
      'Practice gentle stretching or yoga',
      'Listen to calming music or nature sounds',
      'Try progressive muscle relaxation',
      'Write in a journal to clear your mind',
    ],
  },
  {
    category: 'What to Avoid',
    icon: '⚠️',
    avoid: [
      'Screen time 1 hour before bed (blue light disrupts sleep)',
      'Intense exercise within 3 hours of bedtime',
      'Stressful conversations or activities before bed',
      'Clock-watching if you can\'t sleep',
      'Napping after 3 PM',
      'Large amounts of liquid close to bedtime',
    ],
  },
];

const SLEEP_TRACKER_PROMPTS = [
  'What time did you go to bed?',
  'What time did you wake up?',
  'How long did it take to fall asleep?',
  'How many times did you wake up?',
  'How rested do you feel? (1-10)',
];

export default function SleepPage() {
  const [selectedTab, setSelectedTab] = useState<'tips' | 'tracker'>('tips');
  const [sleepData, setSleepData] = useState<{ [key: string]: string }>({});

  const handleSleepDataChange = (prompt: string, value: string) => {
    setSleepData({ ...sleepData, [prompt]: value });
  };

  const calculateSleepDuration = () => {
    const bedtime = sleepData['What time did you go to bed?'];
    const waketime = sleepData['What time did you wake up?'];

    if (bedtime && waketime) {
      // Simple calculation (would be more complex in real app)
      return 'Sleep duration calculated';
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sleep Wellness</h1>
        <p className="text-gray-600 mt-2">
          Quality sleep is essential for mental health and emotional regulation
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b-2 border-gray-200">
        <button
          onClick={() => setSelectedTab('tips')}
          className={`
            px-6 py-3 font-semibold transition-all
            ${selectedTab === 'tips'
              ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          💡 Sleep Tips
        </button>
        <button
          onClick={() => setSelectedTab('tracker')}
          className={`
            px-6 py-3 font-semibold transition-all
            ${selectedTab === 'tracker'
              ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5'
              : 'text-gray-500 hover:text-gray-700'
            }
          `}
        >
          📊 Sleep Tracker
        </button>
      </div>

      {/* Sleep Tips Tab */}
      {selectedTab === 'tips' && (
        <div className="space-y-6">
          {SLEEP_TIPS.map((section, idx) => (
            <div key={idx} className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">{section.icon}</span>
                {section.category}
              </h3>
              <ul className="space-y-3">
                {(section.tips || section.activities || section.avoid || []).map((item, itemIdx) => (
                  <li key={itemIdx} className="flex gap-3 text-gray-700">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Sleep Cycle Info */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🌊 Understanding Sleep Cycles</h3>
            <p className="text-gray-700 mb-4">
              Sleep occurs in 90-minute cycles. Aim for 7-9 hours (5-6 complete cycles) for optimal rest.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { hours: '6h', cycles: '4 cycles' },
                { hours: '7.5h', cycles: '5 cycles' },
                { hours: '9h', cycles: '6 cycles' },
              ].map((option, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{option.hours}</div>
                  <div className="text-sm text-gray-600">{option.cycles}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sleep Tracker Tab */}
      {selectedTab === 'tracker' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Track Your Sleep</h2>

          {SLEEP_TRACKER_PROMPTS.map((prompt, idx) => (
            <div key={idx}>
              <label htmlFor={`sleep-input-${idx}`} className="block text-sm font-semibold text-gray-900 mb-2">
                {prompt}
              </label>
              {prompt.includes('feel') ? (
                <input
                  id={`sleep-input-${idx}`}
                  type="range"
                  min="1"
                  max="10"
                  value={sleepData[prompt] || '5'}
                  onChange={(e) => handleSleepDataChange(prompt, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  aria-label={prompt}
                />
              ) : prompt.includes('time') ? (
                <input
                  id={`sleep-input-${idx}`}
                  type="time"
                  value={sleepData[prompt] || ''}
                  onChange={(e) => handleSleepDataChange(prompt, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  aria-label={prompt}
                />
              ) : (
                <input
                  id={`sleep-input-${idx}`}
                  type="text"
                  value={sleepData[prompt] || ''}
                  onChange={(e) => handleSleepDataChange(prompt, e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500"
                  placeholder="Enter your response..."
                  aria-label={prompt}
                />
              )}
            </div>
          ))}

          <div className="pt-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Notes (optional)
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Any dreams, disturbances, or observations about your sleep..."
            />
          </div>

          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all">
            Save Sleep Log
          </button>
        </div>
      )}

      {/* Warning Box */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <h3 className="font-bold text-yellow-900 mb-2">⚠️ When to Seek Help</h3>
        <p className="text-yellow-800 text-sm">
          If you consistently have trouble sleeping for more than 3 weeks, or if poor sleep is significantly
          affecting your daily life, consider speaking with a healthcare provider about possible sleep disorders.
        </p>
      </div>
    </div>
  );
}

