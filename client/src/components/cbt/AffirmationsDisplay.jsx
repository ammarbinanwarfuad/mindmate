import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const AffirmationsDisplay = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [category, setCategory] = useState('all');

  const affirmations = {
    selfWorth: [
      "I am worthy of love and respect",
      "I am enough just as I am",
      "I deserve happiness and success",
      "I am valuable and important",
      "I accept myself unconditionally"
    ],
    confidence: [
      "I believe in my abilities",
      "I am capable of achieving my goals",
      "I trust myself to make good decisions",
      "I am strong and resilient",
      "I can handle whatever comes my way"
    ],
    positivity: [
      "I choose to focus on the positive",
      "Good things are coming my way",
      "I am grateful for all that I have",
      "I radiate positivity and joy",
      "Every day is a new opportunity"
    ],
    growth: [
      "I am constantly growing and evolving",
      "I learn from my mistakes",
      "Challenges help me grow stronger",
      "I embrace change and new experiences",
      "I am becoming the best version of myself"
    ],
    peace: [
      "I am calm and at peace",
      "I release all worry and anxiety",
      "I am in control of my thoughts",
      "I choose peace over worry",
      "I am safe and secure"
    ]
  };

  const categories = [
    { value: 'all', label: 'All', emoji: '✨' },
    { value: 'selfWorth', label: 'Self-Worth', emoji: '💎' },
    { value: 'confidence', label: 'Confidence', emoji: '💪' },
    { value: 'positivity', label: 'Positivity', emoji: '🌟' },
    { value: 'growth', label: 'Growth', emoji: '🌱' },
    { value: 'peace', label: 'Peace', emoji: '🕊️' }
  ];

  const getAllAffirmations = () => {
    if (category === 'all') {
      return Object.values(affirmations).flat();
    }
    return affirmations[category] || [];
  };

  const currentAffirmations = getAllAffirmations();

  useEffect(() => {
    setCurrentIndex(0);
  }, [category]);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % currentAffirmations.length);
  };

  const previousAffirmation = () => {
    setCurrentIndex((prev) => (prev - 1 + currentAffirmations.length) % currentAffirmations.length);
  };

  const randomAffirmation = () => {
    const randomIndex = Math.floor(Math.random() * currentAffirmations.length);
    setCurrentIndex(randomIndex);
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setCategory(cat.value)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              category === cat.value
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Affirmation Display */}
      <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 rounded-2xl p-12 min-h-[300px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-6xl mb-6">✨</div>
            <p className="text-2xl md:text-3xl font-bold text-white leading-relaxed">
              "{currentAffirmations[currentIndex]}"
            </p>
            <p className="text-white/80 mt-4">
              {currentIndex + 1} of {currentAffirmations.length}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <button
          onClick={previousAffirmation}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={randomAffirmation}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
        >
          🎲 Random
        </button>
        <button
          onClick={nextAffirmation}
          className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Next →
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 How to Use Affirmations</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Read the affirmation slowly and mindfully</li>
          <li>• Repeat it out loud or in your mind</li>
          <li>• Take a deep breath and feel the words</li>
          <li>• Practice daily for best results</li>
          <li>• Choose affirmations that resonate with you</li>
        </ul>
      </div>

      {/* All Affirmations List */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-gray-900">All Affirmations in This Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentAffirmations.map((affirmation, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setCurrentIndex(index)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                index === currentIndex
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-orange-300'
                  : 'bg-white border border-gray-200 hover:border-orange-300'
              }`}
            >
              <p className="text-gray-800">{affirmation}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AffirmationsDisplay;
