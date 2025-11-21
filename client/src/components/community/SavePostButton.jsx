import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SavePostButton = ({ postId, initialSaved = false }) => {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.stopPropagation();
    if (loading) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/community/posts/${postId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSaved(response.data.isSaved);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading}
      className={`p-2 rounded-lg transition-all ${
        isSaved
          ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={isSaved ? 'Unsave post' : 'Save post'}
    >
      <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
    </button>
  );
};

export default SavePostButton;
