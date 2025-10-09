'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import MoodCalendar from './MoodCalendar';
import InsightCard from './InsightCard';

interface MoodEntry {
  _id: string;
  date: string;
  moodScore: number;
  emoji: string;
  triggers: string[];
  activities: string[];
  sleepHours?: number;
}

interface MoodStats {
  average: number;
  total: number;
  streak: number;
  trend: string;
}

export default function MoodDashboard() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState<MoodStats | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodData();
    fetchStats();
  }, [timeRange]);

  const fetchMoodData = async () => {
    try {
      const response = await fetch(`/api/mood/history?range=${timeRange}`);
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Failed to fetch mood data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/mood/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getMoodColor = (score: number) => {
    if (score >= 8) return '#10B981';
    if (score >= 6) return '#6FCF97';
    if (score >= 4) return '#F2C94C';
    if (score >= 2) return '#F59E0B';
    return '#EF4444';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Average Mood"
          value={stats?.average.toFixed(1) || '0'}
          subtitle="out of 10"
          icon="📊"
          color={getMoodColor(stats?.average || 0)}
        />
        <StatCard
          title="Check-ins"
          value={stats?.total || 0}
          subtitle={`this ${timeRange}`}
          icon="📅"
          color="#667eea"
        />
        <StatCard
          title="Streak"
          value={stats?.streak || 0}
          subtitle="consecutive days"
          icon="🎯"
          color="#F59E0B"
        />
        <StatCard
          title="Trend"
          value={stats?.trend || 'N/A'}
          subtitle="compared to last period"
          icon="📈"
          color="#10B981"
        />
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 bg-white p-2 rounded-lg shadow-sm w-fit">
        {(['week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              timeRange === range
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Mood Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Mood Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={entries}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#667eea" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              stroke="#9CA3AF"
            />
            <YAxis domain={[0, 10]} stroke="#9CA3AF" />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="moodScore" 
              stroke="#667eea" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#moodGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InsightCard
          icon="🔍"
          title="Patterns Detected"
          insights={[
            'Your mood tends to be lowest on Mondays',
            'Sleep quality strongly correlates with mood',
            'Exercise days show 15% higher mood scores'
          ]}
          type="pattern"
        />
        <InsightCard
          icon="⚡"
          title="Common Triggers"
          insights={[
            'Academic stress (8 occurrences)',
            'Poor sleep (6 occurrences)',
            'Social isolation (4 occurrences)'
          ]}
          type="trigger"
        />
      </div>

      {/* Mood Calendar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-6 text-gray-900">Mood Calendar</h3>
        <MoodCalendar entries={entries} />
      </div>

      {/* Quick Actions */}
<div className="flex justify-center">
  <a
    href="/mood/new"
    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold"
  >
    <span className="text-2xl">+</span>
    <span>Log Today's Mood</span>
  </a>
</div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg p-6 border-l-4 hover:shadow-xl transition-shadow"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2" style={{ color }}>{value}</p>
          <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
}

// Custom Tooltip
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200">
        <p className="font-semibold text-gray-900">
          {format(new Date(data.date), 'EEEE, MMM d')}
        </p>
        <p className="text-purple-600 font-bold mt-2">
          Mood: {data.moodScore}/10 {data.emoji}
        </p>
        {data.triggers.length > 0 && (
          <p className="text-sm text-gray-600 mt-2">
            Triggers: {data.triggers.join(', ')}
          </p>
        )}
      </div>
    );
  }
  return null;
}