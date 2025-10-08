'use client';

interface MatchCardProps {
  match: {
    userId: string;
    name: string;
    university: string;
    year: number;
    score: number;
    sharedStruggles: string[];
    reason: string;
  };
  onConnect: (userId: string) => void;
  loading: boolean;
}

export default function MatchCard({ match, onConnect, loading }: MatchCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {match.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">{match.name}</h3>
            <p className="text-gray-600">{match.university}</p>
            <p className="text-sm text-gray-500">Year {match.year}</p>
          </div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{match.score}%</div>
          <p className="text-xs text-gray-500">Match</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Shared experiences:</p>
        <div className="flex flex-wrap gap-2">
          {match.sharedStruggles.map((struggle, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
            >
              {struggle}
            </span>
          ))}
        </div>
      </div>

      <p className="text-gray-700 mb-4 italic">{match.reason}</p>

      <button
        onClick={() => onConnect(match.userId)}
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
      >
        {loading ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
}