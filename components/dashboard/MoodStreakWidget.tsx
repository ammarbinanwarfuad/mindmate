'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface StreakData {
  current: number;
  longest: number;
  lastEntry: string;
}

export default function MoodStreakWidget() {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastEntry: '' });

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const response = await fetch('/api/mood/streak');
      const data = await response.json();
      setStreak(data);
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    }
  };

  const getStreakEmoji = () => {
    if (streak.current >= 30) return '🔥🔥🔥';
    if (streak.current >= 14) return '🔥🔥';
    if (streak.current >= 7) return '🔥';
    return '⭐';
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Mood Streak</h3>
        <span className="text-3xl">{getStreakEmoji()}</span>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-white/80 text-sm">Current Streak</p>
          <p className="text-4xl font-bold">{streak.current} days</p>
        </div>
        
        <div className="pt-2 border-t border-white/20">
          <p className="text-white/80 text-sm">Longest Streak</p>
          <p className="text-2xl font-bold">{streak.longest} days</p>
        </div>
      </div>

      {streak.current >= 7 && (
        <div className="mt-4 bg-white/20 rounded-lg p-3">
          <p className="text-sm">Keep it up! Consistency is key to understanding your patterns.</p>
        </div>
      )}
    </motion.div>
  );
}