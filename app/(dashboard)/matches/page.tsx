'use client';

import { useState, useEffect } from 'react';
import MatchCard from '@/components/matches/MatchCard';

interface Match {
  userId: string;
  name: string;
  university: string;
  year: number;
  score: number;
  sharedStruggles: string[];
  reason: string;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matching/find');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    setConnectingId(userId);

    try {
      const response = await fetch('/api/matching/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });

      if (response.ok) {
        alert('Connection request sent!');
        fetchMatches();
      }
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setConnectingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Find Your Peer Support</h1>
        <p className="text-gray-600 mt-2">
          Connect with students who understand what you're going through
        </p>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How Matching Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• We analyze your mood patterns and shared experiences</li>
          <li>• Your data is anonymized and secure</li>
          <li>• You control who can see your profile</li>
          <li>• All connections require mutual acceptance</li>
        </ul>
      </div>

      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.map(match => (
            <MatchCard
              key={match.userId}
              match={match}
              onConnect={handleConnect}
              loading={connectingId === match.userId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500 text-lg">No matches found yet</p>
          <p className="text-sm text-gray-400 mt-2">
            Keep logging your mood to improve matching accuracy
          </p>
        </div>
      )}
    </div>
  );
}