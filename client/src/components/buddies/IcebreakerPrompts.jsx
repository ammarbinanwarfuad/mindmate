import { useState, useEffect } from 'react';
import { MessageCircle, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import api from '../../utils/api';

const IcebreakerPrompts = ({ matchId }) => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/buddies/icebreakers');
      setPrompts(response.data.icebreakers);
    } catch (error) {
      console.error('Error fetching icebreakers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsePrompt = (prompt) => {
    // Copy to clipboard
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied! Paste it in your message. 📋');
  };

  if (loading) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Conversation Starters</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPrompts}
        >
          <RefreshCw className="w-4 h-4" />
          New Prompts
        </Button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Not sure what to talk about? Try these conversation starters:
      </p>

      <div className="space-y-2">
        {prompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleUsePrompt(prompt)}
            className="w-full text-left p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
          >
            <p className="text-sm text-gray-700">{prompt}</p>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 Click any prompt to copy it
      </p>
    </Card>
  );
};

export default IcebreakerPrompts;
