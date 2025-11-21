import { useState, useEffect } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import CreateGoalModal from './CreateGoalModal';
import api from '../../utils/api';

const GoalSuggestions = ({ onGoalCreated }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/goals/suggestions/ai');
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || suggestions.length === 0) return null;

  return (
    <>
      <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h3 className="text-xl font-bold text-gray-900">Suggested Goals for You</h3>
        </div>
        <p className="text-gray-600 mb-6">
          Based on your activity, we recommend these goals to help you grow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-4 border-2 border-gray-200 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{suggestion.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{suggestion.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded inline-block">
                    💡 {suggestion.reason}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span className="capitalize">{suggestion.frequency}</span>
                <span>Target: {suggestion.target}</span>
              </div>

              <Button
                size="sm"
                onClick={() => setSelectedSuggestion(suggestion)}
                className="w-full"
              >
                <Plus className="w-4 h-4" />
                Use This Goal
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {selectedSuggestion && (
        <CreateGoalModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          onGoalCreated={() => {
            setSelectedSuggestion(null);
            onGoalCreated();
          }}
        />
      )}
    </>
  );
};

export default GoalSuggestions;
