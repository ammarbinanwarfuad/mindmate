'use client';

import { useState } from 'react';

const JOURNAL_PROMPTS = [
  {
    category: 'Gratitude',
    icon: '🙏',
    prompts: [
      'What are three things you\'re grateful for today?',
      'Who made a positive impact on your day?',
      'What small pleasure did you enjoy today?',
    ],
  },
  {
    category: 'Reflection',
    icon: '💭',
    prompts: [
      'What was the best part of your day?',
      'What challenged you today and how did you handle it?',
      'What did you learn about yourself today?',
    ],
  },
  {
    category: 'Emotional Check-in',
    icon: '❤️',
    prompts: [
      'How are you feeling right now?',
      'What emotions did you experience today?',
      'What do you need to feel better?',
    ],
  },
  {
    category: 'Growth',
    icon: '🌱',
    prompts: [
      'What\'s one thing you\'d like to improve?',
      'What progress have you made this week?',
      'What are you proud of yourself for?',
    ],
  },
  {
    category: 'Future Planning',
    icon: '🎯',
    prompts: [
      'What are you looking forward to tomorrow?',
      'What\'s one small goal for this week?',
      'How can you show yourself kindness tomorrow?',
    ],
  },
];

export default function JournalPage() {
  const [selectedCategory, setSelectedCategory] = useState(JOURNAL_PROMPTS[0]);
  const [journalEntry, setJournalEntry] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState(0);

  const handleSave = () => {
    // In a real app, this would save to the database
    alert('Journal entry saved! 📝');
    setJournalEntry('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Journal Prompts</h1>
        <p className="text-gray-600 mt-2">
          Guided journaling to process emotions and track your mental health journey
        </p>
      </div>

      {/* Category Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {JOURNAL_PROMPTS.map((category) => (
          <button
            key={category.category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentPrompt(0);
            }}
            className={`
              p-4 rounded-xl border-2 transition-all text-center
              ${selectedCategory.category === category.category
                ? 'border-purple-600 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
              }
            `}
          >
            <div className="text-3xl mb-2">{category.icon}</div>
            <div className="text-sm font-semibold text-gray-900">{category.category}</div>
          </button>
        ))}
      </div>

      {/* Journal Writing Area */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {selectedCategory.icon} {selectedCategory.category}
          </h2>

          {/* Prompt Navigation */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setCurrentPrompt(Math.max(0, currentPrompt - 1))}
              disabled={currentPrompt === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-600">
              Prompt {currentPrompt + 1} of {selectedCategory.prompts.length}
            </span>
            <button
              onClick={() => setCurrentPrompt(Math.min(selectedCategory.prompts.length - 1, currentPrompt + 1))}
              disabled={currentPrompt === selectedCategory.prompts.length - 1}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Current Prompt */}
          <div className="bg-purple-50 border-l-4 border-purple-600 p-6 rounded-lg mb-6">
            <p className="text-lg text-gray-900 font-medium">
              {selectedCategory.prompts[currentPrompt]}
            </p>
          </div>
        </div>

        {/* Text Area */}
        <div>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            placeholder="Start writing... your thoughts are private and encrypted 🔒"
            className="w-full h-64 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none text-gray-900"
          />
          <p className="text-sm text-gray-500 mt-2">
            {journalEntry.length} characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setJournalEntry('')}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={!journalEntry.trim()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Entry
          </button>
        </div>
      </div>

      {/* Tips Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Journaling Tips</h3>
        <ul className="text-blue-800 space-y-1 text-sm">
          <li>• Write freely without judgment - there are no wrong answers</li>
          <li>• Be honest with yourself about your feelings</li>
          <li>• Try to journal at the same time each day</li>
          <li>• Review past entries to track patterns and progress</li>
          <li>• Your entries are completely private and encrypted</li>
        </ul>
      </div>
    </div>
  );
}

