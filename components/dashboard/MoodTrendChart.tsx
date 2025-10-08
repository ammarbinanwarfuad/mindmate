'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

export default function MoodTrendChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const response = await fetch('/api/mood/trend?days=14');
      const result = await response.json();
      setData(result.data || []);
    } catch (error) {
      console.error('Failed to fetch trend:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">14-Day Mood Trend</h3>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              stroke="#9CA3AF"
              style={{ fontSize: '12px' }}
            />
            <YAxis domain={[0, 10]} stroke="#9CA3AF" style={{ fontSize: '12px' }} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border">
                      <p className="font-semibold">{format(new Date(payload[0].payload.date), 'MMM d')}</p>
                      <p className="text-purple-600">Mood: {payload[0].value}/10</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line 
              type="monotone" 
              dataKey="moodScore" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-gray-500">
          No data yet. Start logging your mood!
        </div>
      )}
    </div>
  );
}