import { useState, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TrendingTopics = ({ onTagClick }) => {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/community/trending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrending(response.data.trending);
    } catch (error) {
      console.error('Error fetching trending:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-orange-600" />
        <h3 className="font-bold text-gray-900">Trending Topics</h3>
      </div>

      {trending.length === 0 ? (
        <p className="text-gray-600 text-sm">No trending topics yet</p>
      ) : (
        <div className="space-y-2">
          {trending.map((item, index) => (
            <button
              key={item.tag}
              onClick={() => onTagClick && onTagClick(item.tag)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                <span className="font-medium text-gray-900">#{item.tag}</span>
              </div>
              <span className="text-sm text-gray-600">{item.count} posts</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrendingTopics;
