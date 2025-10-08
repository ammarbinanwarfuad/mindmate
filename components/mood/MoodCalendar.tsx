'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';

interface MoodEntry {
  date: string;
  moodScore: number;
  emoji: string;
}

interface Props {
  entries: MoodEntry[];
}

export default function MoodCalendar({ entries }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getMoodForDate = (date: Date) => {
    return entries.find(entry => 
      isSameDay(new Date(entry.date), date)
    );
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return 'bg-green-400';
    if (score >= 6) return 'bg-green-300';
    if (score >= 4) return 'bg-yellow-300';
    if (score >= 2) return 'bg-orange-300';
    return 'bg-red-400';
  };

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '😄';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😟';
    return '😢';
  };

  // Get starting day of week (0 = Sunday)
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h4 className="text-xl font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h4>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty cells for days before month starts */}
        {emptyDays.map((_, idx) => (
          <div key={`empty-${idx}`} className="aspect-square" />
        ))}

        {/* Days of the month */}
        {days.map(day => {
          const moodEntry = getMoodForDate(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toString()}
              className={`
                aspect-square rounded-lg border-2 flex flex-col items-center justify-center
                transition-all cursor-pointer hover:shadow-md
                ${moodEntry ? getMoodColor(moodEntry.moodScore) : 'bg-gray-50 border-gray-200'}
                ${isToday ? 'border-purple-600 ring-2 ring-purple-200' : 'border-transparent'}
              `}
              title={moodEntry ? `Mood: ${moodEntry.moodScore}/10` : 'No entry'}
            >
              <span className={`text-sm font-medium ${moodEntry ? 'text-white' : 'text-gray-600'}`}>
                {format(day, 'd')}
              </span>
              {moodEntry && (
                <span className="text-xl">{moodEntry.emoji || getMoodEmoji(moodEntry.moodScore)}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-red-400 rounded"></div>
          <span className="text-sm text-gray-600">1-2</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-orange-300 rounded"></div>
          <span className="text-sm text-gray-600">3-4</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-yellow-300 rounded"></div>
          <span className="text-sm text-gray-600">5-6</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-300 rounded"></div>
          <span className="text-sm text-gray-600">7-8</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-400 rounded"></div>
          <span className="text-sm text-gray-600">9-10</span>
        </div>
      </div>
    </div>
  );
}